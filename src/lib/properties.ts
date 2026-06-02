import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import type { Property } from "@/components/property-card";

export const featuredProperties: Property[] = [
  {
    id: "casolare-bagnone",
    title: "Casolare con uliveto",
    location: "Bagnone, Lunigiana",
    price: "€ 485.000",
    type: "Casa di pietra restaurata",
    sqm: 240,
    rooms: 4,
    image: property1,
    tag: "In evidenza",
  },
  {
    id: "borgo-pontremoli",
    title: "Casa nel borgo storico",
    location: "Pontremoli, centro",
    price: "€ 215.000",
    type: "Casa di carattere",
    sqm: 130,
    rooms: 3,
    image: property2,
    tag: "Nuovo",
  },
  {
    id: "villa-villafranca",
    title: "Villa con vista valle",
    location: "Villafranca in Lunigiana",
    price: "€ 720.000",
    type: "Villa panoramica",
    sqm: 320,
    rooms: 5,
    image: property3,
    tag: "Vista aperta",
  },
];

export const allProperties: Property[] = [
  ...featuredProperties,
  {
    id: "rustico-filattiera",
    title: "Rustico da reinterpretare",
    location: "Filattiera",
    price: "€ 168.000",
    type: "Rustico",
    sqm: 180,
    rooms: 4,
    image: property1,
  },
  {
    id: "appartamento-mulazzo",
    title: "Appartamento con terrazzo",
    location: "Mulazzo",
    price: "€ 135.000",
    type: "Appartamento",
    sqm: 95,
    rooms: 3,
    image: property2,
  },
  {
    id: "villa-zeri",
    title: "Casa tra i boschi",
    location: "Zeri",
    price: "€ 295.000",
    type: "Casa indipendente",
    sqm: 160,
    rooms: 3,
    image: property3,
    tag: "Con giardino",
  },
];

export const territories = [
  {
    slug: "pontremoli",
    name: "Pontremoli",
    tagline: "La capitale di pietra della Lunigiana",
    body: "Vie acciottolate, palazzi affrescati e il torrente Magra che attraversa la città. Vivere a Pontremoli significa abitare la storia con discrezione.",
  },
  {
    slug: "bagnone",
    name: "Bagnone",
    tagline: "Il castello, il borgo, il torrente",
    body: "Un borgo verticale che si affaccia su una piazza-mercato medievale. Adatto a chi cerca silenzio, sapori antichi e una comunità viva.",
  },
  {
    slug: "zeri",
    name: "Zeri",
    tagline: "Boschi, pascoli, lentezza",
    body: "Valli profonde, allevamenti, sentieri storici. Una Lunigiana wild per chi cerca un ritmo davvero diverso, lontano dal turismo di massa.",
  },
  {
    slug: "villafranca",
    name: "Villafranca",
    tagline: "Sul cammino della Francigena",
    body: "Tra il museo etnografico e i ponti antichi. Una porta naturale verso l'alta Lunigiana, ben collegata e ricca di servizi.",
  },
  {
    slug: "filattiera",
    name: "Filattiera",
    tagline: "Pievi romaniche e colline morbide",
    body: "Una delle zone più contemplative della Lunigiana. Perfetta per case di campagna immerse nel verde, a pochi minuti da Pontremoli.",
  },
  {
    slug: "mulazzo",
    name: "Mulazzo",
    tagline: "Dante, Malaspina, e una vista lunga",
    body: "Borgo letterario per eccellenza, con scorci che spaziano sull'intera valle. Casa qui significa luce, panorama, e una storia da custodire.",
  },
];