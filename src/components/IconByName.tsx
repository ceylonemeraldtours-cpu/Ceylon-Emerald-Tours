import {
  Bike,
  Binoculars,
  Building2,
  Camera,
  Castle,
  Cat,
  Coffee,
  Compass,
  Egg,
  Fish,
  Footprints,
  Landmark,
  Leaf,
  Mountain,
  Palmtree,
  PawPrint,
  RadioTower,
  Ship,
  ShoppingBag,
  Sparkles,
  Sunrise,
  Train,
  Utensils,
  Waves,
  type LucideIcon,
} from "lucide-react";

// Keys here are the `iconName` values used in src/data/toursData.ts.
const ICONS: Record<string, LucideIcon> = {
  bike: Bike,
  binoculars: Binoculars,
  building: Building2,
  camera: Camera,
  castle: Castle,
  cat: Cat,
  coffee: Coffee,
  compass: Compass,
  egg: Egg,
  fish: Fish,
  footprints: Footprints,
  landmark: Landmark,
  leaf: Leaf,
  mountain: Mountain,
  palmtree: Palmtree,
  paw: PawPrint,
  "radio-tower": RadioTower,
  ship: Ship,
  "shopping-bag": ShoppingBag,
  sparkles: Sparkles,
  sunrise: Sunrise,
  train: Train,
  utensils: Utensils,
  waves: Waves,
};

export default function IconByName({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
