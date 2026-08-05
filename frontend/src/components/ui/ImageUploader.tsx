import { useRef, type ChangeEvent } from "react";
import { useUploadImageMutation } from "../../features/upload/uploadApi";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploadImage, { isLoading }] = useUploadImageMutation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadImage(file).unwrap();
      onChange([...images, result.url]);
    } catch {
      alert(
        "Échec de l'upload — vérifiez le format (jpeg/png/webp) et la taille (max 5 Mo)",
      );
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = (url: string) => {
    onChange(images.filter((img) => img !== url));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((url) => (
          <div
            key={url}
            className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 rounded-full text-xs leading-none flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={isLoading}
        className="text-sm text-slate-600"
      />
      {isLoading && (
        <p className="text-sm text-slate-500 mt-1">Envoi en cours...</p>
      )}
    </div>
  );
}
