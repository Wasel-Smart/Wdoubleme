/**
 * UI Molecules — Layer 2
 * Composed of 2+ atoms. Zero business logic. Max 10 props.
 * Used in 3+ feature domains.
 */

// Composition molecules (shadcn)
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../card';
export { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../dialog';
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../dropdown-menu';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
export { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../sheet';
export { Alert, AlertDescription, AlertTitle } from '../alert';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip';
export { Popover, PopoverContent, PopoverTrigger } from '../popover';
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../collapsible';
export { ScrollArea } from '../scroll-area';
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../table';

// Wasel brand molecules (dark glassmorphic)
export { WaselCard } from '../../wasel-ui/WaselCard';
export { WaselSectionHeader } from '../../wasel-ui/WaselSectionHeader';
export { AIRecommendations } from '../../wasel-ui/AIRecommendations';
export { WaselTripCard } from '../../wasel-ui/WaselTripCard';
export { WaselDriverCard } from '../../wasel-ui/WaselDriverCard';
export { WaselStatsRow, WaselStatCard, WaselKPIBanner } from '../../wasel-ui/WaselStatsRow';

// Wasel DS molecules (light surface)
export { DSInputGroup, DSSearchInput, DSOTPInput } from '../../wasel-ds/DSInputs';
export { DSRideSearchForm, DSOfferRideForm, DSLoginForm, DSPackageForm } from '../../wasel-ds/DSForms';
export { DSNotifCard, DSAlertBanner } from '../../wasel-ds/DSNotifications';

// Wasel UI molecules (dark surface)
export { WaselSearchBar, WaselSelect, WaselChipGroup } from '../../wasel-ui/WaselInput';
