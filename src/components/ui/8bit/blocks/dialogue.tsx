import { cn } from "@/lib/utils";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/8bit/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/8bit/avatar";

export interface DialogueProps extends React.ComponentProps<"div"> {
  avatarSrc?: string;
  avatarFallback?: string;
  /** Custom avatar content (e.g. an animated sprite) — takes priority
   * over `avatarSrc`/`avatarFallback` when provided. */
  avatarNode?: React.ReactNode;
  title?: string;
  description?: string;
  player?: boolean;
  font?: "normal" | "retro";
}

export default function Dialogue({
  className,
  avatarSrc,
  avatarFallback,
  avatarNode,
  title,
  description,
  player = true,
  font,
  ...props
}: DialogueProps) {
  const avatar = (
    <Avatar variant="retro" className="size-16 items-center justify-center">
      {avatarNode ?? (
        <>
          <AvatarImage src={avatarSrc} alt={avatarFallback} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </>
      )}
    </Avatar>
  );

  return (
    <div className={cn("flex gap-4 items-center", className)} {...props}>
      {player && avatar}
      <Alert font={font} className={cn("mx-0", !player && "text-right")}>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>

      {!player && avatar}
    </div>
  );
}
