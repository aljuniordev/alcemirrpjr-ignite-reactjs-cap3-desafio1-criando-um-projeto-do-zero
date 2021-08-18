import { Component, ReactElement } from "react";

export default class Comments extends Component<ReactElement> {
  componentDidMount() {
    const script = document.createElement("script");
    const anchor = document.getElementById("inject-comments-for-uterances");
    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("async", "true");
    script.setAttribute(
      "repo",
      "alcemirrpjr/alcemirrpjr-ignite-reactjs-cap3-desafio1-criando-um-projeto-do-zero"
    );
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("theme", "github-dark");
    anchor.appendChild(script);
  }

  render() {
    return <div id="inject-comments-for-uterances" />;
  }
}
