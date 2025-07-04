import { RiMessage2Line, RiQuestionLine, RiTimeLine, RiMenuLine } from "@/lib/icons";

interface NodeTypePaletteItemProps {
  type: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

function NodeTypePaletteItem({ type, label, icon, color }: NodeTypePaletteItemProps) {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="draggable mb-2 flex cursor-grab items-center rounded-md border border-gray-200 bg-white p-3 shadow-sm transition-all hover:shadow"
      onDragStart={(event) => onDragStart(event, type)}
      draggable
    >
      <div className={`mr-3 rounded p-2 text-white ${color}`}>
        {icon}
      </div>
      <span>{label}</span>
    </div>
  );
}

export function SidebarPalette() {
  return (
    <div className="flex w-64 flex-col border-r border-gray-200 bg-gray-50 p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase text-gray-600">Elementos</h3>
      
      <p className="mb-2 text-xs text-gray-500">Arrastra elementos al flujo</p>
      
      <NodeTypePaletteItem
        type="message"
        label="Mensaje"
        icon={<RiMessage2Line />}
        color="bg-blue-500"
      />
      
      <NodeTypePaletteItem
        type="question"
        label="Pregunta"
        icon={<RiQuestionLine />}
        color="bg-purple-500"
      />
      
      <NodeTypePaletteItem
        type="delay"
        label="Espera"
        icon={<RiTimeLine />}
        color="bg-yellow-500"
      />
      
      <NodeTypePaletteItem
        type="menu"
        label="Menú de opciones"
        icon={<RiMenuLine />}
        color="bg-indigo-500"
      />
      
      <div className="mt-auto pt-4">
        <h3 className="mb-2 text-sm font-semibold uppercase text-gray-600">Ayuda</h3>
        <p className="text-xs text-gray-500">
          Conecta los nodos arrastrando desde los puntos de conexión para crear el flujo de conversación.
        </p>
      </div>
    </div>
  );
}
