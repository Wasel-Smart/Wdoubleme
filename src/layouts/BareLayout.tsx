/**
 * BareLayout — renders Outlet with no header/footer shell.
 * Used for fully self-contained pages like DoubleMeLanding.
 */
import { Outlet } from 'react-router';

export default function BareLayout() {
  return <Outlet />;
}
