import "./Avatar.css";

import React from "react";

interface IProps {
  img: string;
  alt: string;
  boderStyle?: "dashed" | "solid";
}

export default function Avatar({ img, alt, boderStyle }: IProps) {
	return (
		<div
			className={`avatar ${
				boderStyle === "dashed"
					? "avatar-dashed"
					: boderStyle === "solid"
						? "avatar-solid"
						: ""
			}`}
		>
			<img src={img} alt={alt} />
		</div>
	);
}
