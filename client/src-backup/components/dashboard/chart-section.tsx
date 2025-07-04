import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const DUMMY_DAILY_DATA = [
  { name: "Lunes", messages: 312 },
  { name: "Martes", messages: 220 },
  { name: "Miércoles", messages: 375 },
  { name: "Jueves", messages: 450 },
  { name: "Viernes", messages: 325 },
  { name: "Sábado", messages: 400 },
  { name: "Domingo", messages: 425 }
];

const DUMMY_WEEKLY_DATA = [
  { name: "Sem 1", messages: 1800 },
  { name: "Sem 2", messages: 2200 },
  { name: "Sem 3", messages: 1950 },
  { name: "Sem 4", messages: 2400 }
];

const DUMMY_MONTHLY_DATA = [
  { name: "Ene", messages: 6000 },
  { name: "Feb", messages: 8000 },
  { name: "Mar", messages: 9500 },
  { name: "Abr", messages: 7500 },
  { name: "May", messages: 10000 },
  { name: "Jun", messages: 11000 }
];

const DUMMY_CHATBOT_DATA = [
  { name: "Soporte", value: 45, color: "hsl(var(--primary))" },
  { name: "Ventas", value: 30, color: "hsl(var(--chart-2))" },
  { name: "Información", value: 25, color: "hsl(var(--chart-3))" }
];

type TimeframeType = "daily" | "weekly" | "monthly";

export function ChartSection() {
  const [timeframe, setTimeframe] = useState<TimeframeType>("daily");
  
  // In a real application, we would fetch this data from the API
  const { data: messagesData } = useQuery({
    queryKey: ["/api/analytics/messages", timeframe],
    initialData: timeframe === "daily" 
      ? DUMMY_DAILY_DATA 
      : timeframe === "weekly" 
        ? DUMMY_WEEKLY_DATA 
        : DUMMY_MONTHLY_DATA
  });
  
  const { data: chatbotData } = useQuery({
    queryKey: ["/api/analytics/chatbots"],
    initialData: DUMMY_CHATBOT_DATA
  });
  
  const totalMessages = chatbotData.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Main Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Mensajes por Día</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className={timeframe === "daily" ? "bg-primary-100 text-primary-700" : ""}
              onClick={() => setTimeframe("daily")}
            >
              Diario
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={timeframe === "weekly" ? "bg-primary-100 text-primary-700" : ""}
              onClick={() => setTimeframe("weekly")}
            >
              Semanal
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={timeframe === "monthly" ? "bg-primary-100 text-primary-700" : ""}
              onClick={() => setTimeframe("monthly")}
            >
              Mensual
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={messagesData}
                margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis hide />
                <Tooltip 
                  formatter={(value) => [`${value} mensajes`, 'Mensajes']}
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: 'none',
                    borderRadius: '0.375rem',
                    color: 'white',
                    fontSize: '0.75rem',
                    padding: '0.5rem'
                  }}
                  itemStyle={{ color: 'white' }}
                  labelStyle={{ fontWeight: 'bold', color: 'white' }}
                />
                <Bar 
                  dataKey="messages" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Distribución por Chatbot</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="h-40 w-40 mx-auto mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chatbotData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chatbotData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Porcentaje']}
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: 'none',
                    borderRadius: '0.375rem',
                    color: 'white',
                    fontSize: '0.75rem',
                    padding: '0.5rem'
                  }}
                  itemStyle={{ color: 'white' }}
                  labelStyle={{ fontWeight: 'bold', color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="space-y-2 mt-4 w-full">
            {chatbotData.map((item, index) => (
              <div key={index} className="flex items-center">
                <span 
                  className="mr-2 h-3 w-3 rounded-full" 
                  style={{ backgroundColor: item.color }} 
                />
                <span className="text-sm text-gray-600">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChartSection;
