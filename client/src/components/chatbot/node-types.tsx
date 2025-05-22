import { Handle, Position } from "reactflow";
import { cn } from "@/lib/utils";
import { RiMessage2Line, RiQuestionLine, RiTimeLine, RiMenuLine } from "@/lib/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const nodeBaseClasses = "border shadow-md rounded-md bg-white";

export function StartNode({ data, selected }: any) {
  return (
    <div
      className={cn(
        nodeBaseClasses,
        "border-green-500 bg-green-50 px-4 py-2",
        selected && "ring-2 ring-green-500"
      )}
    >
      <div className="flex items-center">
        <div className="mr-2 rounded bg-green-500 p-1 text-white">
          <RiMessage2Line size={18} />
        </div>
        <div>
          <div className="text-sm font-medium">Inicio</div>
          <div className="text-xs text-gray-500">{data.label}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="h-3 w-3 bg-green-500" />
    </div>
  );
}

export function MessageNode({ data, selected }: any) {
  return (
    <div
      className={cn(
        nodeBaseClasses,
        "border-blue-500 px-4 py-2",
        selected && "ring-2 ring-blue-500"
      )}
    >
      <Handle type="target" position={Position.Top} className="h-3 w-3 bg-blue-500" />
      <div className="flex items-center">
        <div className="mr-2 rounded bg-blue-500 p-1 text-white">
          <RiMessage2Line size={18} />
        </div>
        <div>
          <div className="text-sm font-medium">Mensaje</div>
          <div className="text-xs text-gray-500">{data.message || "Mensaje para el usuario"}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="h-3 w-3 bg-blue-500" />
    </div>
  );
}

export function QuestionNode({ data, selected }: any) {
  return (
    <div
      className={cn(
        nodeBaseClasses,
        "border-purple-500 px-4 py-2",
        selected && "ring-2 ring-purple-500"
      )}
    >
      <Handle type="target" position={Position.Top} className="h-3 w-3 bg-purple-500" />
      <div className="flex items-center">
        <div className="mr-2 rounded bg-purple-500 p-1 text-white">
          <RiQuestionLine size={18} />
        </div>
        <div>
          <div className="text-sm font-medium">Pregunta</div>
          <div className="text-xs text-gray-500">{data.question || "Pregunta al usuario"}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Opciones: {data.options?.length || 0}
      </div>
      <Handle type="source" position={Position.Bottom} className="h-3 w-3 bg-purple-500" />
    </div>
  );
}

export function DelayNode({ data, selected }: any) {
  return (
    <div
      className={cn(
        nodeBaseClasses,
        "border-yellow-500 px-4 py-2",
        selected && "ring-2 ring-yellow-500"
      )}
    >
      <Handle type="target" position={Position.Top} className="h-3 w-3 bg-yellow-500" />
      <div className="flex items-center">
        <div className="mr-2 rounded bg-yellow-500 p-1 text-white">
          <RiTimeLine size={18} />
        </div>
        <div>
          <div className="text-sm font-medium">Espera</div>
          <div className="text-xs text-gray-500">{data.delay || "1"} segundos</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="h-3 w-3 bg-yellow-500" />
    </div>
  );
}

export function MenuNode({ data, selected }: any) {
  return (
    <div
      className={cn(
        nodeBaseClasses,
        "border-indigo-500 px-4 py-2",
        selected && "ring-2 ring-indigo-500"
      )}
    >
      <Handle type="target" position={Position.Top} className="h-3 w-3 bg-indigo-500" />
      <div className="flex items-center">
        <div className="mr-2 rounded bg-indigo-500 p-1 text-white">
          <RiMenuLine size={18} />
        </div>
        <div>
          <div className="text-sm font-medium">Menú</div>
          <div className="text-xs text-gray-500">{data.menu || "Menú de opciones"}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Opciones: {data.options?.length || 0}
      </div>
      <Handle type="source" position={Position.Bottom} className="h-3 w-3 bg-indigo-500" />
    </div>
  );
}

export const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  question: QuestionNode,
  delay: DelayNode,
  menu: MenuNode
};
