import React from "react";

import Footer from "./Footer";
import Spinner from "./Spinner";

export default function LoadingPage(): JSX.Element {

  return (
    <section className="hero is-fullheight-with-navbar">
      <div className="hero-body"><Spinner /></div>
      <Footer />
    </section>
  );
}
