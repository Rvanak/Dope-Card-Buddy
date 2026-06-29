// rifleBullets.seed.ts

export const manufacturers = [
  "Hornady",
  "Berger",
  "Nosler",
  "Barnes",
  "Sierra",
  "Speer",
  "Federal",
  "Winchester",
  "Remington",
  "Lapua",
  "Swift",
  "Cutting Edge Bullets",
  "Hammer Bullets",
  "Lehigh Defense",
  "Badlands Precision",
  "North Fork",
  "Woodleigh",
  "Peregrine",
  "Maker Bullets"
];

export const rifleBulletDatabase = [
  {
    caliber: ".17",
    diameter_in: 0.172,
    weights_gr: [15, 17, 20, 25, 30],
    manufacturers: ["Hornady", "Berger", "Nosler"]
  },
  {
    caliber: ".20 / .204",
    diameter_in: 0.204,
    weights_gr: [24, 32, 35, 39, 40, 45, 50, 55],
    manufacturers: ["Hornady", "Berger", "Nosler", "Barnes", "Sierra"]
  },
  {
    caliber: ".22 / .224",
    diameter_in: 0.224,
    weights_gr: [35, 40, 45, 50, 52, 53, 55, 60, 62, 64, 68, 69, 70, 73, 75, 77, 80, 85, 88, 90],
    manufacturers: ["Hornady", "Berger", "Nosler", "Barnes", "Sierra", "Speer", "Federal", "Winchester", "Remington", "Lapua", "Lehigh Defense", "Hammer Bullets", "Maker Bullets"]
  },
  {
    caliber: "6mm / .243",
    diameter_in: 0.243,
    weights_gr: [55, 58, 60, 65, 68, 70, 75, 80, 87, 90, 95, 100, 103, 105, 107, 108, 109, 110, 112, 115],
    manufacturers: ["Hornady", "Berger", "Nosler", "Barnes", "Sierra", "Speer", "Federal", "Winchester", "Remington", "Lapua", "Cutting Edge Bullets", "Hammer Bullets", "Badlands Precision"]
  },
  {
    caliber: ".25 / .257",
    diameter_in: 0.257,
    weights_gr: [75, 85, 87, 90, 100, 110, 115, 117, 120, 125, 131, 133, 135],
    manufacturers: ["Hornady", "Berger", "Nosler", "Barnes", "Sierra", "Speer", "Federal", "Winchester", "Remington", "Hammer Bullets", "Badlands Precision"]
  },
  {
    caliber: "6.5mm / .264",
    diameter_in: 0.264,
    weights_gr: [85, 90, 95, 100, 107, 120, 123, 127, 129, 130, 135, 140, 143, 144, 147, 150, 153.5, 156, 160],
    manufacturers: ["Hornady", "Berger", "Nosler", "Barnes", "Sierra", "Speer", "Federal", "Winchester", "Remington", "Lapua", "Swift", "Cutting Edge Bullets", "Hammer Bullets", "Badlands Precision", "Maker Bullets"]
  },
  {
    caliber: ".270 / .277",
    diameter_in: 0.277,
    weights_gr: [90, 100, 110, 115, 120, 130, 135, 140, 145, 150, 165, 170, 175],
    manufacturers: ["Hornady", "Berger", "Nosler", "Barnes", "Sierra", "Speer", "Federal", "Winchester", "Remington", "Swift", "Hammer Bullets", "Badlands Precision"]
  },
  {
    caliber: "7mm / .284",
    diameter_in: 0.284,
    weights_gr: [100, 110, 120, 130, 139, 140, 145, 150, 154, 160, 162, 168, 175, 180, 184, 190, 195],
    manufacturers: ["Hornady", "Berger", "Nosler", "Barnes", "Sierra", "Speer", "Federal", "Winchester", "Remington", "Lapua", "Swift", "Cutting Edge Bullets", "Hammer Bullets", "Badlands Precision", "Maker Bullets"]
  },
  {
    caliber: ".30 / .308",
    diameter_in: 0.308,
    weights_gr: [110, 125, 130, 135, 150, 155, 165, 168, 175, 178, 180, 185, 190, 195, 200, 208, 210, 212, 215, 220, 225, 230, 240, 245, 250],
    manufacturers: ["Hornady", "Berger", "Nosler", "Barnes", "Sierra", "Speer", "Federal", "Winchester", "Remington", "Lapua", "Swift", "Cutting Edge Bullets", "Hammer Bullets", "Badlands Precision", "Lehigh Defense", "Maker Bullets"]
  },
  {
    caliber: ".311 / .312",
    diameter_in: 0.311,
    weights_gr: [123, 150, 174, 180, 200, 215],
    manufacturers: ["Hornady", "Sierra", "Speer", "Lapua", "Woodleigh", "Peregrine"]
  },
  {
    caliber: "8mm / .323",
    diameter_in: 0.323,
    weights_gr: [150, 170, 180, 195, 200, 220],
    manufacturers: ["Hornady", "Nosler", "Barnes", "Sierra", "Speer", "Woodleigh", "Swift"]
  },
  {
    caliber: ".338",
    diameter_in: 0.338,
    weights_gr: [160, 180, 200, 210, 215, 225, 230, 250, 265, 270, 285, 300],
    manufacturers: ["Hornady", "Berger", "Nosler", "Barnes", "Sierra", "Speer", "Federal", "Winchester", "Lapua", "Swift", "Cutting Edge Bullets", "Hammer Bullets", "Badlands Precision", "Woodleigh", "Peregrine"]
  },
  {
    caliber: ".348",
    diameter_in: 0.348,
    weights_gr: [150, 180, 200, 220, 250],
    manufacturers: ["Hornady", "Barnes", "Woodleigh", "Swift"]
  },
  {
    caliber: ".35 / .358",
    diameter_in: 0.358,
    weights_gr: [150, 180, 200, 220, 225, 250, 275, 280, 310],
    manufacturers: ["Hornady", "Nosler", "Barnes", "Sierra", "Speer", "Swift", "Woodleigh", "North Fork", "Hammer Bullets"]
  },
  {
    caliber: "9.3mm / .366",
    diameter_in: 0.366,
    weights_gr: [232, 250, 258, 270, 286, 300, 320],
    manufacturers: ["Hornady", "Barnes", "Nosler", "Swift", "Woodleigh", "North Fork", "Peregrine"]
  },
  {
    caliber: ".375",
    diameter_in: 0.375,
    weights_gr: [200, 235, 250, 260, 270, 300, 350],
    manufacturers: ["Hornady", "Berger", "Nosler", "Barnes", "Sierra", "Speer", "Swift", "Woodleigh", "North Fork", "Cutting Edge Bullets", "Hammer Bullets", "Peregrine"]
  },
  {
    caliber: ".408",
    diameter_in: 0.408,
    weights_gr: [300, 350, 390, 400, 420, 450],
    manufacturers: ["Berger", "Cutting Edge Bullets", "Lehigh Defense", "Badlands Precision", "Hammer Bullets"]
  },
  {
    caliber: ".416",
    diameter_in: 0.416,
    weights_gr: [300, 325, 350, 400, 450, 500],
    manufacturers: ["Hornady", "Berger", "Barnes", "Swift", "Woodleigh", "North Fork", "Cutting Edge Bullets", "Peregrine"]
  },
  {
    caliber: ".423 / .404",
    diameter_in: 0.423,
    weights_gr: [300, 350, 400, 450],
    manufacturers: ["Hornady", "Barnes", "Swift", "Woodleigh", "North Fork", "Peregrine"]
  },
  {
    caliber: ".458",
    diameter_in: 0.458,
    weights_gr: [250, 300, 325, 350, 400, 405, 450, 500, 550],
    manufacturers: ["Hornady", "Barnes", "Sierra", "Speer", "Swift", "Woodleigh", "North Fork", "Cutting Edge Bullets", "Lehigh Defense", "Peregrine"]
  },
  {
    caliber: ".510 / .50 BMG",
    diameter_in: 0.510,
    weights_gr: [647, 650, 660, 700, 750, 800],
    manufacturers: ["Hornady", "Barnes", "Berger", "Lehigh Defense", "Cutting Edge Bullets", "Badlands Precision"]
  }
];

export type RifleBulletCaliber = typeof rifleBulletDatabase[number];
