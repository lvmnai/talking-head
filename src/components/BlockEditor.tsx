import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ScenarioBlock } from "./ScenarioBlock";
import { BlockActionsPanel } from "./BlockActionsPanel";
import { ScenarioStats } from "./ScenarioStats";
import { Button } from "./ui/button";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";

export interface Block {
  id: string;
  type: string;
  content: string;
  quality: "strong" | "medium" | "weak";
  feedback?: string;
}

const BLOCK_TYPES = [
  { value: "hook", label: "Хук" },
  { value: "transition", label: "Переход" },
  { value: "problem", label: "История / проблема" },
  { value: "solution", label: "Решение" },
  { value: "proof", label: "Доказательства" },
  { value: "offer", label: "Оффер" },
  { value: "cta", label: "CTA" },
  { value: "ps", label: "Постскриптум" },
];

interface BlockEditorProps {
  initialText: string;
  onSave: (text: string) => void;
}

export const BlockEditor = ({ initialText, onSave }: BlockEditorProps) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Parse initial text into blocks
    const paragraphs = initialText.split('\n\n').filter(p => p.trim());
    const initialBlocks: Block[] = paragraphs.map((content, idx) => ({
      id: `block-${Date.now()}-${idx}`,
      type: BLOCK_TYPES[Math.min(idx, BLOCK_TYPES.length - 1)].value,
      content,
      quality: "medium",
    }));
    setBlocks(initialBlocks);
  }, []);

  useEffect(() => {
    if (blocks.length > 0) {
      analyzeScenario();
    }
  }, [blocks]);

  const analyzeScenario = async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke('analyze-full-scenario', {
        body: { blocks }
      });

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error analyzing scenario:', error);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleBlockUpdate = (id: string, content: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const handleBlockDelete = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const handleBlockDuplicate = (id: string) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;
    
    const newBlock = {
      ...block,
      id: `block-${Date.now()}`,
    };
    
    const index = blocks.findIndex(b => b.id === id);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
  };

  const handleAddBlock = () => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: "transition",
      content: "",
      quality: "medium",
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleSave = () => {
    const fullText = blocks.map(b => b.content).join('\n\n');
    onSave(fullText);
    toast.success('Сценарий сохранён');
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="flex gap-6 min-h-[600px]">
      {/* Left Panel - Blocks */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Блоки сценария</h3>
          <Button onClick={handleAddBlock} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Добавить блок
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map(b => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {blocks.map((block) => (
                <ScenarioBlock
                  key={block.id}
                  block={block}
                  blockTypes={BLOCK_TYPES}
                  isSelected={selectedBlockId === block.id}
                  onSelect={() => setSelectedBlockId(block.id)}
                  onUpdate={handleBlockUpdate}
                  onDelete={handleBlockDelete}
                  onDuplicate={handleBlockDuplicate}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <Button onClick={handleSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Сохранить все изменения
        </Button>
      </div>

      {/* Right Panel - Actions */}
      <div className="w-80 space-y-4">
        {selectedBlock ? (
          <BlockActionsPanel
            block={selectedBlock}
            onUpdate={(content) => handleBlockUpdate(selectedBlock.id, content)}
          />
        ) : (
          <div className="sketch-border p-6 text-center text-muted-foreground">
            Выберите блок для редактирования
          </div>
        )}

        {stats && <ScenarioStats stats={stats} />}
      </div>
    </div>
  );
};
