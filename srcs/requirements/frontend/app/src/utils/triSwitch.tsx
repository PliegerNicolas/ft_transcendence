export default function triSwitch(
	status: string,
	onSuccess: JSX.Element,
	onPending: JSX.Element,
	onError: JSX.Element)
{
	switch (status) {
		case "success":
			return (onSuccess);
		case "pending":
			return (onPending);
		case "error":
			return (onError);
	}
	return (
		<div>
			Unknown status: {status}
		</div>
	);
}