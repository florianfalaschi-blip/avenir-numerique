/**
 * @avenir/ui — Composants UI partagés (admin + e-commerce)
 *
 * Basé sur shadcn/ui (composants copy-paste, customisables).
 * Style : Tailwind CSS avec variables CSS pour le thème.
 */

export { cn } from './lib/utils';

// Composants de base
export { Button, buttonVariants, type ButtonProps } from './components/button';
export { Input, type InputProps } from './components/input';
export { Label, type LabelProps } from './components/label';
export { Pill, type PillProps } from './components/pill';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './components/card';
