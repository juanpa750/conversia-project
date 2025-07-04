import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/layout";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";

export default function App() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Switch>
          <Route path="/auth/login" component={Login} />
          <Route path="/auth/register" component={Register} />
          <Route path="/:rest*">
            {() => (
              <Layout>
                <Switch>
                  <Route path="/" component={Dashboard} />
                  <Route component={NotFound} />
                </Switch>
              </Layout>
            )}
          </Route>
        </Switch>
        <Toaster />
      </div>
    </TooltipProvider>
  );
}