/**
 * UI Atoms — Layer 1
 * Zero business logic. Used in 3+ feature domains. Fully token-driven.
 * Max 6 props per atom.
 *
 * Eligibility rule (3-Strike): only promoted here after use in 3+ domains.
 */

// Base shadcn atoms
export { Button } from '../button';
export { Input } from '../input';
export { Label } from '../label';
export { Badge } from '../badge';
export { Avatar, AvatarFallback, AvatarImage } from '../avatar';
export { Separator } from '../separator';
export { Skeleton } from '../skeleton';
export { Switch } from '../switch';
export { Checkbox } from '../checkbox';
export { Progress } from '../progress';
export { Slider } from '../slider';
export { Toggle } from '../toggle';
export { Textarea } from '../textarea';

// Wasel brand atoms
export { WaselBadge } from '../../wasel-ui/WaselBadge';

// Wasel DS atoms (light surface)
export { DSInput, DSInputLabel } from '../../wasel-ds/DSInputs';

// Wasel UI atoms (dark surface)
export { WaselInput, WaselToggle } from '../../wasel-ui/WaselInput';
