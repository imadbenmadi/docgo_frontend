import { Outlet } from "react-router-dom";

function UserMessages_Default() {
    return (
        <div className="w-full">
            <Outlet />
        </div>
    );
}

export default UserMessages_Default;
