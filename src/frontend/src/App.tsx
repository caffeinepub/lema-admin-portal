import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Layout from "./components/Layout";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin } from "./hooks/useQueries";
import CustomerService from "./pages/CustomerService";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import Orders from "./pages/Orders";
import Partners from "./pages/Partners";
import Payments from "./pages/Payments";

export type Page =
  | "dashboard"
  | "orders"
  | "partners"
  | "payments"
  | "customerservice";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="space-y-3 w-64">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const { identity, isInitializing } = useInternetIdentity();
  const { isFetching } = useActor();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  if (isInitializing || (identity && isFetching)) {
    return <LoadingScreen />;
  }

  if (!identity) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  if (isAdminLoading) {
    return <LoadingScreen />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-display text-foreground">
            Access Denied
          </h2>
          <p className="text-muted-foreground">
            You do not have admin access to this portal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Layout currentPage={page} onNavigate={setPage}>
        {page === "dashboard" && <Dashboard />}
        {page === "orders" && <Orders />}
        {page === "partners" && <Partners />}
        {page === "payments" && <Payments />}
        {page === "customerservice" && <CustomerService />}
      </Layout>
      <Toaster />
    </>
  );
}
