import { seedWork } from "./seed";
import type { Work } from "./types";

// Only untouched illustrative records from the original demo are updated.
const oldTitles = ["A finish worth a second look", "Panel restoration", "Every detail counts", "Back in shape", "From impact to finish", "Ready for the road", "A fresh coat of confidence", "Color, with character", "The finishing touch", "Under the hood", "Stopping power", "Keeping things moving", "Access matters", "Care in the details", "A smoother way in"];
const oldDescriptions = ["Example of a restored sports coupe.", "A sample panel restoration in the workshop.", "An example of careful bodywork and finishing.", "Illustrative bumper and front-panel repair.", "An example of collision repair work in progress.", "A sample repaired vehicle after finishing.", "Illustrative red paint refinishing.", "A sample blue automotive finish.", "Example of polishing and final paint inspection.", "Illustrative engine maintenance in the workshop.", "A sample brake service.", "An example vehicle inspection on a lift.", "Illustrative accessible van with a wheelchair lift.", "An example of lift mechanism inspection.", "Sample accessible vehicle lift platform."];
export const showcaseUpdates = seedWork.slice(0, 15).map((item,index) => ({ id:item.id, oldTitle:oldTitles[index], oldDescription:oldDescriptions[index], data:{ title:item.title, description:item.description, customerLabel:item.customerLabel, vehicle:item.vehicle } }));
export function updateLegacyProject(work: Work): Work | undefined {
  const update = showcaseUpdates.find(item => item.id === work.id);
  if (!update || !work.demo || work.customerLabel || work.title !== update.oldTitle || work.description !== update.oldDescription) return;
  return { ...work, ...update.data };
}
