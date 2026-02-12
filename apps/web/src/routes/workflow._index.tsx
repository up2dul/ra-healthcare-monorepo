import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { ArrowRight, Plus, Save } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "urql";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SortableStep } from "@/components/workflow/sortable-step";
import type { LocalWorkflowStep } from "@/components/workflow/types";
import { WorkflowSkeleton } from "@/components/workflow/workflow-skeleton";
import { saveWorkflowMutation, workflowStepsQuery } from "@/graphql/workflow";
import { arrayMove, cn } from "@/lib/utils";
import type { Route } from "./+types/workflow._index";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Workflow Builder | RaHealthcare" }];
}

let tempIdCounter = 0;

function nextTempId() {
  return `new-${++tempIdCounter}`;
}

export default function WorkflowPage() {
  const [result, reexecuteQuery] = useQuery({ query: workflowStepsQuery });
  const [saveResult, saveWorkflow] = useMutation(saveWorkflowMutation);

  const [steps, setSteps] = useState<LocalWorkflowStep[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Seed local state from server data on first load
  useEffect(() => {
    if (result.data?.workflowSteps && !hasChanges) {
      setSteps(
        (result.data.workflowSteps as { id: string; label: string }[]).map(
          (s) => ({
            id: s.id,
            label: s.label,
          }),
        ),
      );
    }
  }, [result.data, hasChanges]);

  const addStep = useCallback(() => {
    const label = newLabel.trim();
    if (!label) return;
    setSteps((prev) => [...prev, { id: nextTempId(), label }]);
    setNewLabel("");
    setHasChanges(true);
    inputRef.current?.focus();
  }, [newLabel]);

  const removeStep = useCallback((id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    const input = {
      steps: steps.map((s, i) => {
        const isNew = s.id.startsWith("new-");
        return {
          // Omit id entirely for new steps so GraphQL doesn't send null
          ...(isNew ? {} : { id: s.id }),
          label: s.label,
          order: i,
        };
      }),
    };

    const res = await saveWorkflow({ input });
    if (!res.error) {
      setHasChanges(false);
      reexecuteQuery({ requestPolicy: "network-only" });
    }
  };

  if (result.fetching && !result.data) {
    return <WorkflowSkeleton />;
  }

  if (result.error) {
    return (
      <div className="space-y-4">
        <h1 className="font-bold text-xl">Workflow Builder</h1>
        <p className="text-destructive text-sm">
          {result.error.message || "Failed to load workflow"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl">Workflow Builder</h1>
          <p className="text-muted-foreground text-sm">
            Define the clinic workflow steps. Drag to reorder.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saveResult.fetching}
        >
          <Save data-icon="inline-start" />
          {saveResult.fetching ? "Saving…" : "Save"}
        </Button>
      </header>

      {/* Add new step */}
      <Card>
        <CardContent className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addStep();
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Registration, Examination…"
              disabled={saveResult.fetching}
              aria-label="New step label"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newLabel.trim() || saveResult.fetching}
            >
              <Plus data-icon="inline-start" />
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sortable step list */}
      {steps.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Workflow Steps</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <DragDropProvider
              onDragEnd={(event) => {
                if (event.canceled) return;
                const { source } = event.operation;
                if (!source || !isSortable(source)) return;

                const from = source.sortable.initialIndex;
                const to = source.sortable.index;
                if (from !== to) {
                  setSteps((prev) => arrayMove(prev, from, to));
                  setHasChanges(true);
                }
              }}
            >
              <ol className="flex flex-col gap-2" aria-label="Workflow steps">
                {steps.map((step, index) => (
                  <SortableStep
                    key={step.id}
                    step={step}
                    index={index}
                    onRemove={removeStep}
                    disabled={saveResult.fetching}
                  />
                ))}
              </ol>
            </DragDropProvider>

            {/* Visual flow preview */}
            <nav
              className="mt-6 flex flex-wrap items-center gap-1 border-t pt-4"
              aria-label="Workflow flow preview"
            >
              {steps.map((step, i) => (
                <span key={step.id} className="inline-flex items-center gap-1">
                  <span
                    className={cn(
                      "rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-xs",
                    )}
                  >
                    {step.label}
                  </span>
                  {i < steps.length - 1 && (
                    <ArrowRight
                      className="size-3.5 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </span>
              ))}
            </nav>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12">
            <p className="text-muted-foreground text-sm">
              No workflow steps yet. Add your first step above.
            </p>
          </CardContent>
        </Card>
      )}

      {saveResult.error && (
        <p className="text-destructive text-sm">
          {saveResult.error.message || "Failed to save workflow"}
        </p>
      )}
    </div>
  );
}
