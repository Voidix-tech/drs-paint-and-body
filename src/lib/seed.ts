import type { Service, Work } from "./types";
export const seedServices: Service[] = ([
  { id: "autobody", slug: "autobody", title: "Autobody", description: "Dents, damaged panels, and bodywork brought back into shape. Tell us what happened and we'll talk through the next step.", visible: true, order: 0 },
  { id: "collision", slug: "collision-repair", title: "Collision repair", description: "From damaged bumpers to body repairs after a collision, get help bringing your vehicle back to the road.", visible: true, order: 1 },
  { id: "painting", slug: "painting", title: "Painting", description: "Fresh paint, panel refinishing, and finishing touches. Let's talk about the color and finish you have in mind.", visible: true, order: 2 },
  { id: "repair", slug: "auto-repair", title: "Auto repair", description: "When something doesn't feel right, start with a conversation. Contact the shop about your vehicle and the repair you need.", visible: true, order: 3 },
  { id: "lift", slug: "wheelchair-lift-repair", title: "Wheelchair lift repair", description: "Discuss repairs for your vehicle's wheelchair lift. Call with your lift model and the issue so we can confirm how we can help.", visible: true, order: 4 },
  { id: "sales", slug: "car-sales", title: "Car sales", description: "Explore the virtual showroom and get in touch about a vehicle. Contact the shop to confirm availability and details.", visible: true, order: 5 }
] as Omit<Service, "type">[]).map(service => ({ ...service, type: service.id === "sales" ? "showroom" : "gallery" }));
const samples: Record<string, [string, string][]> = {
  autobody: [["A finish worth a second look", "Example of a restored sports coupe."], ["Panel restoration", "A sample panel restoration in the workshop."], ["Every detail counts", "An example of careful bodywork and finishing."]],
  collision: [["Back in shape", "Illustrative bumper and front-panel repair."], ["From impact to finish", "An example of collision repair work in progress."], ["Ready for the road", "A sample repaired vehicle after finishing."]],
  painting: [["A fresh coat of confidence", "Illustrative red paint refinishing."], ["Color, with character", "A sample blue automotive finish."], ["The finishing touch", "Example of polishing and final paint inspection."]],
  repair: [["Under the hood", "Illustrative engine maintenance in the workshop."], ["Stopping power", "A sample brake service."], ["Keeping things moving", "An example vehicle inspection on a lift."]],
  lift: [["Access matters", "Illustrative accessible van with a wheelchair lift."], ["Care in the details", "An example of lift mechanism inspection."], ["A smoother way in", "Sample accessible vehicle lift platform."]],
  sales: [["2018 Chevrolet Camaro", "An illustrative coupe listing for this demo. Not actual inventory."], ["2020 Toyota Camry", "An illustrative sedan listing for this demo. Not actual inventory."], ["2019 Ford F-150", "An illustrative pickup listing for this demo. Not actual inventory."]]
};
export const seedWork: Work[] = seedServices.flatMap(service => samples[service.id].map(([title, description], index) => ({ id: `${service.id}-${index + 1}`, serviceId: service.id, title, description, images: [`/images/${service.id}-${index + 1}.webp`], visible: true, demo: true, ...(service.id === "sales" ? { year: [2018,2020,2019][index], price: [22900,18900,26500][index], mileage: [68400,51200,82300][index], availability: "available" as const } : {}) })));
