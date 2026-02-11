import { Href, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import Constants from "expo-constants";

// Constant
import useNotification from "@/lib/hooks/useNotification";
import { ROUTES, STORE_TOKEN } from "@/lib/utils/constants";
import SpinnerComponent from "@/lib/ui/useable-components/spinner";

function App() {
  const notificationRef = useRef(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const router = useRouter();
  const {
    restaurantData,
    getPermission,
    getExpoPushToken,
    getDevicePushToken,
    // requestPermission,
    sendTokenToBackend,
  } = useNotification();



  const init = async () => {
    router.replace(ROUTES.login as Href);
  };

  useEffect(() => {
    const checkToken = async () => {
      try {
        if (hasInitialized) return;
        
        // Set timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          if (!hasInitialized) {
            console.log('Timeout reached, proceeding to login');
            setHasInitialized(true);
            init();
          }
        }, 3000); // 3 second timeout

        if (restaurantData?.restaurant?.enableNotification && notificationRef?.current) {
          const permissionStatus = await getPermission();
          if (permissionStatus.granted) {
            const token = (await getDevicePushToken()).data;

            try {
              console.log({ token });
              sendTokenToBackend({
                variables: { token, isEnabled: true },
                onCompleted: () => {
                  clearTimeout(timeoutId);
                  setHasInitialized(true);
                  init();
                },
                onError: () => {
                  clearTimeout(timeoutId);
                  setHasInitialized(true);
                  init();
                },
              });
            } catch (err) {
              clearTimeout(timeoutId);
              setHasInitialized(true);
              init();
            }
          } else {
            clearTimeout(timeoutId);
            setHasInitialized(true);
            init();
          }
        } else if (restaurantData) {
          // If restaurantData exists but notifications are disabled
          clearTimeout(timeoutId);
          setHasInitialized(true);
          init();
        }
        
        notificationRef.current = false;
      } catch (err) {
        console.log({ checkToken: JSON.stringify(err, null, 2) });
        setHasInitialized(true);
        init();
      }
    };
    checkToken();
  }, [restaurantData, hasInitialized]);

  console.log("Running...", { hasInitialized, restaurantData: !!restaurantData });

  return <SpinnerComponent />;
}

export default App;
