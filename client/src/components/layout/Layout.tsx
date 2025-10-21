// components/layout/Layout.jsx
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children?: React.ReactNode;
  mainComponent?: React.ReactNode; // component passed as JSX
}

export default function Layout({ children, mainComponent }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {mainComponent} {/* render the passed component */}
        {children}
      </main>
      <Footer />
    </div>
  );
}
