import { useState } from "react";
import { Star, StarIcon } from "lucide-react";
import { RiStarFill } from "react-icons/ri";

type FavoriteStarProps = {
  initialFavorite?: boolean;
  onToggle?: (favorited: boolean) => void;
};

export default function FavoriteStar({
  initialFavorite = false,
  onToggle,
}: FavoriteStarProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorite);

  const handleClick = () => {
    const newState = !isFavorited;
    setIsFavorited(newState);
    onToggle?.(newState); 
  };

  return (
    <button
      onClick={handleClick}
      className="ml-3 mt-1"
      aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      {isFavorited ? (
        <RiStarFill className="h-6 w-6 text-accent" />
      ) : (
        <Star className="h-6 w-6 text-accent" />
      )}
    </button>
  );
}
