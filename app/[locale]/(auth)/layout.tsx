import Link from "next/link";
import { getTranslations } from "next-intl/server";

import "@/app/[locale]/globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";
import Footer from "@/app/[locale]/(routes)/components/Footer";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const { locale } = params;

  const t = await getTranslations({ locale, namespace: "RootLayout" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col justify-center items-center h-screen overflow-hidden w-full relative">
      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle />
      </div>
      <div className="flex items-center justify-center grow h-full w-full">
        {children}
      </div>
      <div className="absolute bottom-2 w-full flex justify-center">
        <Footer />
      </div>
    </div>
  );
};

export default AuthLayout;
