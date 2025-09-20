// app/utils/uploadthing.js
import { generateReactHelpers } from "@uploadthing/react/generate-react-helpers";

import { ourFileRouter } from "../api/uploadthing/core";

export const { useUploadThing } = generateReactHelpers();
