import { useEffect, useState } from "react";
import { grade, loadRubric, navigate, readRoute, routeFor } from "./lib/api";
import { shortName } from "./lib/format";
import { CALM, WIDE, useMedia } from "./hooks/useMedia";
import CompareView from "./views/CompareView";
import HomeView, { OnTrack, RaceControl } from "./views/HomeView";
import ProfileView from "./views/ProfileView";
import RepoView from "./views/RepoView";

function titleFor(state) {
  if (state.status !== "done") return "GitRep: every point, accounted for";
  const { data } = state;
  if (Array.isArray(data)) return `${shortName(data[0].repo.name)} vs ${shortName(data[1].repo.name)} · GitRep`;
  if (data.kind === "profile") return `${data.owner.login} · average ${data.average} · GitRep`;
  return `${shortName(data.repo.name)} · ${data.score}/100 · GitRep`;
}

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const [rubric, setRubric] = useState(null);
  const [state, setState] = useState({ status: "idle" });
  const wide = useMedia(WIDE);
  const calm = useMedia(CALM);

  useEffect(() => {
    const sync = () => setRoute(readRoute());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  useEffect(() => {
    loadRubric().then(setRubric).catch(() => setRubric(null));
  }, []);

  useEffect(() => {
    if (route.kind === "home") {
      setState({ status: "idle" });
      return undefined;
    }
    let live = true;
    setState({ status: "loading" });
    const job =
      route.kind === "compare"
        ? Promise.all([grade(route.a), grade(route.b)]).then((pair) => {
            if (pair.some((r) => r.kind !== "repo")) throw new Error("Compare takes two repositories, like owner/one vs owner/two.");
            return pair;
          })
        : grade(route.target);
    job
      .then((data) => live && setState({ status: "done", data }))
      .catch((error) => live && setState({ status: "error", message: error.message }));
    return () => {
      live = false;
    };
  }, [route]);

  useEffect(() => {
    document.title = titleFor(state);
  }, [state]);

  const onGo = (value) => {
    const next = routeFor(value);
    if (next) navigate(next);
  };

  if (route.kind === "home") return <HomeView rubric={rubric} wide={wide} onGo={onGo} />;
  if (state.status === "error") return <RaceControl message={state.message} route={route} onGo={onGo} />;
  if (state.status !== "done") return <OnTrack route={route} rubric={rubric} />;

  const { data } = state;
  const key = Array.isArray(data) ? `${data[0].repo.name}|${data[1].repo.name}` : data.kind === "profile" ? data.owner.login : data.repo.name;
  if (Array.isArray(data)) return <CompareView key={key} a={data[0]} b={data[1]} wide={wide} calm={calm} onGo={onGo} />;
  if (data.kind === "profile") return <ProfileView key={key} report={data} wide={wide} calm={calm} onGo={onGo} />;
  return <RepoView key={key} report={data} wide={wide} calm={calm} onGo={onGo} />;
}
