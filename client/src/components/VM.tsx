import "./VM.css";

import Hyperbeam from "@hyperbeam/iframe";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

// TODO: consolidate api interactions in one place?
async function startHyperbeamSession(id: string) {
	const response = await fetch(`${import.meta.env.VITE_API_SERVER_BASE_URL}/${id}`);
	if (response.ok) {
		const data = await response.json();
		const hbiframe = document.getElementById("hyperbeam") as HTMLIFrameElement | null;
		if (hbiframe) return Hyperbeam(hbiframe, data.embedUrl);
	}
}

interface IProps {
	onLoad: () => void;
}

// TODO: vm do be tiny tho
export default function VM({ onLoad }: IProps) {
	const { id } = useParams();
	useEffect(() => {
		if (id)
			startHyperbeamSession(id).then(() => {
				onLoad();
			});
	}, [id]);
	return <div id="VM">
		<iframe id="hyperbeam" title="Hyperbeam" />
	</div>;
}