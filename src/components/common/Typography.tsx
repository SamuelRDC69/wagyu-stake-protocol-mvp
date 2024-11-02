// Typography.tsx
const Typography = {
  H1: ({ children, className = "" }) => (
    <h1 className={`text-4xl font-bold tracking-tight ${className}`}>
      {children}
    </h1>
  ),
  H2: ({ children, className = "" }) => (
    <h2 className={`text-3xl font-semibold tracking-tight ${className}`}>
      {children}
    </h2>
  ),
  H3: ({ children, className = "" }) => (
    <h3 className={`text-2xl font-semibold ${className}`}>{children}</h3>
  ),
  H4: ({ children, className = "" }) => (
    <h4 className={`text-xl font-semibold ${className}`}>{children}</h4>
  ),
  Body: ({ children, className = "" }) => (
    <p className={`text-base leading-7 ${className}`}>{children}</p>
  ),
  Small: ({ children, className = "" }) => (
    <p className={`text-sm leading-6 ${className}`}>{children}</p>
  ),
  Label: ({ children, className = "" }) => (
    <span className={`text-sm font-medium ${className}`}>{children}</span>
  )
};