"use client";

import * as Icons from "lucide-react";
import { useCallback, useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEFAULT_PERSONAS } from "@/features/personas";

interface PersonaSelectorProps {
  selectedPersonaSlug: string;
  onSelectPersona: (slug: string) => void;
}

function getIconComponent(iconName: string) {
  const iconsMap = Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  const Icon = iconsMap[iconName];
  return Icon ?? Icons.MessageSquare;
}

export function PersonaSelector({ selectedPersonaSlug, onSelectPersona }: PersonaSelectorProps) {
  const selectedPersona = useMemo(() => {
    const found = DEFAULT_PERSONAS.find((p) => p.slug === selectedPersonaSlug);
    return found ?? DEFAULT_PERSONAS[0]!;
  }, [selectedPersonaSlug]);

  const Icon = useMemo(() => getIconComponent(selectedPersona.icon), [selectedPersona.icon]);

  const handleSelect = useCallback(
    (slug: string) => {
      onSelectPersona(slug);
    },
    [onSelectPersona],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Icon className="size-4" />
          {selectedPersona.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Select Persona</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {DEFAULT_PERSONAS.map((persona) => {
          const PersonaIcon = getIconComponent(persona.icon);
          return (
            <DropdownMenuItem
              key={persona.slug}
              onClick={() => handleSelect(persona.slug)}
              className="flex-col items-start gap-1 py-3"
            >
              <div className="flex w-full items-center gap-2">
                <PersonaIcon className="size-4 shrink-0" />
                <span className="font-medium">{persona.name}</span>
              </div>
              <p className="text-muted-foreground text-xs">{persona.description}</p>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
