import { PermissionData } from "@hyperbeam/web";
import { hbApiRequest } from "../utils/helpers";

type sessionAPIProps = {
	adminToken: string;
	embedUrl: string;
};

export default function hbSessionAPI(props: sessionAPIProps) {
	const parsedEmbedUrl = new URL(props.embedUrl);
	return {
		async setPermissions(userId: string, permissions: Partial<PermissionData>): Promise<void> {
			return hbApiRequest<void, [string, Partial<PermissionData>]>({
				baseUrl: parsedEmbedUrl.origin + parsedEmbedUrl.pathname,
				authBearer: props.adminToken,
				path: `/setPermissions`,
				method: "POST",
				body: [userId, permissions],
			});
		},
		async kickUser(userId: string): Promise<void> {
			return hbApiRequest<void, undefined>({
				baseUrl: parsedEmbedUrl.origin + parsedEmbedUrl.pathname,
				authBearer: props.adminToken,
				path: `/users/${userId}`,
				method: "DELETE",
				body: undefined,
			});
		},
	};
}
