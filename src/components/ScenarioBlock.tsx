import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Block } from "./BlockEditor";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  GripVertical,
  ChevronDown,
  ChevronUp,
  Trash2,
  Copy,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ScenarioBlockProps {
  block: Block;
  blockTypes: Array<{ value: string; label: string }>;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export const ScenarioBlock = ({
  block,
  blockTypes,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
}: ScenarioBlockProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "strong":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "weak":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case "strong":
        return "Сильный блок";
      case "medium":
        return "Средний блок";
      case "weak":
        return "Слабый блок";
      default:
        return "";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sketch-border bg-background transition-all ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <button
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <Select
          value={block.type}
          onValueChange={(value) => {
            // Handle type change if needed
          }}
        >
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {blockTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(block.id);
          }}
        >
          <Copy className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
        >
          {isCollapsed ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronUp className="h-3 w-3" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(block.id);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-3">
          <Textarea
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            className="min-h-[100px] resize-none"
            placeholder="Введите текст блока..."
          />
          
          {block.feedback && (
            <p className="text-xs text-muted-foreground mt-2">
              💡 {block.feedback}
            </p>
          )}
        </div>
      )}

      {/* Quality Indicator */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-border">
        <div className={`h-2 flex-1 rounded-full ${getQualityColor(block.quality)}`} />
        <span className="text-xs text-muted-foreground">
          {getQualityLabel(block.quality)}
        </span>
      </div>
    </div>
  );
};
