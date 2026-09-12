import { SignIn } from "@clerk/react-router";

export default function SignInPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: "4rem" }}>
      <SignIn />
    </div>
  );
}
