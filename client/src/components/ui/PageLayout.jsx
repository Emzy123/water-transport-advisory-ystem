const sizes = {
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  full: 'max-w-7xl',
};

export default function PageLayout({ children, size = 'xl', className = '' }) {
  return (
    <div className={`mx-auto px-4 py-10 sm:px-6 lg:px-8 ${sizes[size]} ${className}`}>
      {children}
    </div>
  );
}
