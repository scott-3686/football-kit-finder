import './globals.css';


export const metadata = {
  title:
    'Football Kit Finder',

  description:
    'Find affordable football kits for kids.'
};


export default function RootLayout({
  children
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}