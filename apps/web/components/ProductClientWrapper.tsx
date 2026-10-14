import { ReactNode } from "react";

interface ProductClientWrapperProps {
  children: ReactNode;
}

// Plain layout wrappers. They used to fade and slide in on load, which delayed
// the product photo and buttons for no benefit.
export const ProductAnimationWrapper = ({ children }: ProductClientWrapperProps) => (
  <div className="bg-gray-50/50 min-h-screen">{children}</div>
);

export const ProductImageWrapper = ({ children }: ProductClientWrapperProps) => (
  <div className="w-full md:w-1/2">{children}</div>
);

export const ProductDetailsWrapper = ({ children }: ProductClientWrapperProps) => (
  <div className="w-full md:w-1/2 flex flex-col gap-5">{children}</div>
);

export const ProductActionWrapper = ({
  children,
}: ProductClientWrapperProps & { delay?: number }) => <div>{children}</div>;

export const ProductSectionWrapper = ({
  children,
}: ProductClientWrapperProps & { delay?: number }) => <div>{children}</div>;
