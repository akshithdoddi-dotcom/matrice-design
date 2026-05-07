import { cn } from "@/app/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Container = ({ children, className, ...props }: ContainerProps) => {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] px-6", className)} {...props}>
      {children}
    </div>
  );
};
