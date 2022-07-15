import Hyperbeam from "@hyperbeam/iframe";
import React from "react";
import { ReactNode } from "react";
import { useParams } from "react-router-dom";

interface IProps {
	params: { id: string | null | undefined; };
}

interface IState {
}

class VMElement extends React.Component<IProps, IState> {
	constructor(props) {
		super(props);
		this.state = {};
	}

	async componentDidMount() {
		const { id } = this.props.params;
		const apiResponse = await fetch(`http://localhost:3000/api/rooms/${id}`).then(response => {
			console.log(response);
			return response.json();
		});
		const hbiframe = document.getElementById("hyperbeam") as HTMLIFrameElement | null;
		if (hbiframe) {
			await Hyperbeam(hbiframe, apiResponse.embedUrl);
		}
	}

	render(): ReactNode {
		return <div className="OAuth">
			<h2>VM</h2>
			<iframe id="hyperbeam" title="Hyperbeam" />
		</div>;
	}
}

const VM = (props) => {
	return <VMElement {...props} params={useParams()} />;
};

export default VM;