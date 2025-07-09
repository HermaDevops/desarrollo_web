import "@/styles/globals.css";
import Layout from '../components/Layout';
import type { AppProps } from "next/app";

export default function App({ Component, pageProps, router }: AppProps & { router: any }) {
  const noLayoutRoutes = ['/'];

  const isLayoutVisible = !noLayoutRoutes.includes(router.pathname);

  return isLayoutVisible ? (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  ) : (
    <Component {...pageProps} />
  );
}
