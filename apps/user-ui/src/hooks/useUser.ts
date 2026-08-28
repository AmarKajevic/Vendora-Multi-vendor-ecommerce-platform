import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useAuthStore } from "../store/authStore";
import { isProtected } from "../utils/protected";
import { User } from "../types/user";



const fetchUser = async (isLoggedIn: boolean): Promise<User | null> => {
  try {
    const config = isLoggedIn ? isProtected : {};
    const response = await axiosInstance.get<{ user: User }>(
      "/api/logged-in-user",
      config
    );
    console.log(response.data.user);
    return response.data.user ?? null;
  } catch (error) {
    console.log(error);
    return null;
  }
};
const useUser = () => {
  const { setLoggedIn, isLoggedIn } = useAuthStore();

  const { data: user, isLoading, isError } = useQuery<User | null>({
    queryKey: ["user"],
    queryFn: () => fetchUser(isLoggedIn),
    enabled: isLoggedIn, 
    staleTime: 1000 * 60 * 5,
    retry: false,
    //@ts-ignore
    onSuccess: () => setLoggedIn(true),
    onError: () => setLoggedIn(false),
  });

  return { user, isLoading, isError };
};

export default useUser;