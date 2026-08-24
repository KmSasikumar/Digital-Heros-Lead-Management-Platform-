export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-sm leading-loose text-muted-foreground">
          Built for <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Digital Heroes Training Task</a>
        </p>
      </div>
    </footer>
  );
}
