import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';
import { CheckoutDto } from './dto/checkout.dto';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

// Le découpage du panier en commandes est la partie la plus risquée du
// module : elle réserve du stock AVANT de créer les commandes, et doit le
// rendre si quoi que ce soit échoue entre-temps. Ces tests couvrent la règle
// « adresse postale exigée uniquement s'il y a du physique » et son
// interaction avec ce rollback.

const CONTACT = {
  fullName: 'Amina Belkacem',
  email: 'amina@exemple.ma',
  phone: '+212600000000',
};

const ADDRESS = {
  country: 'Maroc',
  city: 'Casablanca',
  addressLine: '12 rue des Oudayas',
  postalCode: '20000',
};

const physicalProduct = (id: string, sellerId = 'seller-1') => ({
  _id: id,
  title: `Produit ${id}`,
  type: 'physical' as const,
  sellerId,
});

const digitalProduct = (id: string, sellerId = 'seller-1') => ({
  _id: id,
  title: `Produit ${id}`,
  type: 'digital' as const,
  sellerId,
});

const cartLine = (productId: string, quantity = 1) => ({
  productId,
  quantity,
  title: `Produit ${productId}`,
  price: 100,
  images: [],
  subtotal: 100 * quantity,
});

describe('OrdersService.checkout', () => {
  let service: OrdersService;
  let cartService: { getCart: jest.Mock; clearCart: jest.Mock };
  let productsService: {
    findOne: jest.Mock;
    decrementStock: jest.Mock;
    restoreStock: jest.Mock;
  };
  let orderModel: { create: jest.Mock };

  const dto = (shipping: CheckoutDto['shipping']): CheckoutDto => ({
    paymentMethod: 'cash',
    shipping,
  });

  beforeEach(async () => {
    cartService = { getCart: jest.fn(), clearCart: jest.fn() };
    productsService = {
      findOne: jest.fn(),
      decrementStock: jest.fn().mockResolvedValue(true),
      restoreStock: jest.fn().mockResolvedValue(undefined),
    };
    // create() reçoit un tableau d'appels distincts (un par groupe) — on
    // renvoie l'objet tel quel pour pouvoir l'inspecter dans les assertions.
    orderModel = { create: jest.fn((doc: unknown) => Promise.resolve(doc)) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order.name), useValue: orderModel },
        { provide: CartService, useValue: cartService },
        { provide: ProductsService, useValue: productsService },
        { provide: UsersService, useValue: { findById: jest.fn() } },
        { provide: EmailService, useValue: { sendDigitalDelivery: jest.fn() } },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('refuse un panier physique sans adresse postale et rend le stock réservé', async () => {
    cartService.getCart.mockResolvedValue({
      items: [cartLine('p1'), cartLine('p2')],
      total: 200,
    });
    productsService.findOne
      .mockResolvedValueOnce(physicalProduct('p1'))
      .mockResolvedValueOnce(physicalProduct('p2'));

    await expect(
      service.checkout('buyer-1', dto({ ...CONTACT })),
    ).rejects.toBeInstanceOf(BadRequestException);

    // L'adresse manque dès le premier article : rien n'a pu être réservé,
    // donc aucune commande ne doit exister et le panier reste intact.
    expect(orderModel.create).not.toHaveBeenCalled();
    expect(cartService.clearCart).not.toHaveBeenCalled();
    expect(productsService.decrementStock).not.toHaveBeenCalled();
  });

  it('rejette avant toute réservation quand le physique arrive après un numérique', async () => {
    cartService.getCart.mockResolvedValue({
      items: [cartLine('d1'), cartLine('p1', 3)],
      total: 400,
    });
    productsService.findOne
      .mockResolvedValueOnce(digitalProduct('d1'))
      .mockResolvedValueOnce(physicalProduct('p1'));

    await expect(
      service.checkout('buyer-1', dto({ ...CONTACT })),
    ).rejects.toBeInstanceOf(BadRequestException);

    // assertDeliverable() s'exécute AVANT decrementStock() sur le premier
    // article physique : le panier ne peut donc jamais se retrouver avec du
    // stock réservé à cause de cette erreur-là. Rien à rendre, rien à créer.
    expect(orderModel.create).not.toHaveBeenCalled();
    expect(productsService.decrementStock).not.toHaveBeenCalled();
    expect(productsService.restoreStock).not.toHaveBeenCalled();
  });

  it('accepte un panier 100 % numérique avec le seul contact', async () => {
    cartService.getCart.mockResolvedValue({
      items: [cartLine('d1')],
      total: 100,
    });
    productsService.findOne.mockResolvedValue(digitalProduct('d1'));

    const orders = await service.checkout('buyer-1', dto({ ...CONTACT }));

    expect(orders).toHaveLength(1);
    expect(orderModel.create).toHaveBeenCalledTimes(1);
    expect(orderModel.create.mock.calls[0][0].shipping).toEqual(CONTACT);
    expect(cartService.clearCart).toHaveBeenCalledWith('buyer-1');
  });

  it('crée une commande par vendeur+type et ne garde le contact que sur la numérique', async () => {
    cartService.getCart.mockResolvedValue({
      items: [cartLine('p1'), cartLine('d1')],
      total: 200,
    });
    productsService.findOne
      .mockResolvedValueOnce(physicalProduct('p1', 'seller-1'))
      .mockResolvedValueOnce(digitalProduct('d1', 'seller-1'));

    const orders = await service.checkout(
      'buyer-1',
      dto({ ...CONTACT, ...ADDRESS }),
    );

    expect(orders).toHaveLength(2);

    const created = orderModel.create.mock.calls.map((call) => call[0]);
    const physical = created.find((o) => o.fulfillmentType === 'physical');
    const digital = created.find((o) => o.fulfillmentType === 'digital');

    expect(physical.shipping).toEqual({ ...CONTACT, ...ADDRESS });
    // Même formulaire, mais la commande numérique ne conserve pas l'adresse.
    expect(digital.shipping).toEqual(CONTACT);
    expect(digital.shipping.city).toBeUndefined();
  });

  it('refuse une adresse dont un champ n’est que des espaces', async () => {
    cartService.getCart.mockResolvedValue({
      items: [cartLine('p1')],
      total: 100,
    });
    productsService.findOne.mockResolvedValue(physicalProduct('p1'));

    await expect(
      service.checkout('buyer-1', dto({ ...CONTACT, ...ADDRESS, city: '   ' })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
