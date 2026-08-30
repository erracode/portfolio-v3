import { Button } from "@/components/ui/8bit/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/8bit/dialog"

import { useCombatStore } from "@/lib/combat-store"

/**
 * Game Over dialog shown when the player dies. Dismissing it (ESC, overlay,
 * or the button) resurrects the player at spawn — there is no way to stay
 * dead.
 */
export function GameOverDialog() {
  const playerDead = useCombatStore((state) => state.playerDead)
  const resurrectPlayer = useCombatStore((state) => state.resurrectPlayer)

  return (
    <Dialog
      open={playerDead}
      onOpenChange={(open) => {
        if (!open) resurrectPlayer()
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Game Over</DialogTitle>
        </DialogHeader>
        <p className="text-center text-sm text-muted-foreground">
          Has caído en batalla.
        </p>
        <DialogFooter className="justify-center sm:justify-center">
          <Button variant="default" onClick={resurrectPlayer}>
            Resucitar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}