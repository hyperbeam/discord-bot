import { PermissionData } from "@hyperbeam/web";
import { hbApiRequest } from "../utils/helpers";

type sessionAPIProps = {
	adminToken: string;
	embedUrl: string;
};

export default function hbSessionAPI(props: sessionAPIProps) {
	return {
		async setPermissions(userId: string, permissions: Partial<PermissionData>): Promise<void> {
			return hbApiRequest<void, [string, Partial<PermissionData>]>({
				baseUrl: new URL(props.embedUrl).href,
				authBearer: props.adminToken,
				path: `/setPermissions/${userId}`,
				method: "POST",
				body: [userId, permissions],
			});
		},
		async kickUser(userId: string): Promise<void> {
			return hbApiRequest<void, undefined>({
				baseUrl: new URL(props.embedUrl).href,
				authBearer: props.adminToken,
				path: `/users/${userId}`,
				method: "DELETE",
				body: undefined,
			});
		},
	};
}
