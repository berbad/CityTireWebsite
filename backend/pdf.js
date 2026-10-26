const {jsPDF}=require('jspdf');
const {createHash}=require('node:crypto');
const money=cents=>(cents/100).toFixed(2);
function renderReceiptPdf(receipt,revision){
 const doc=new jsPDF();
 doc.setProperties({title:`${receipt.number} - revision ${revision.revision}`,author:'City Tire Repair Shop',creator:'City Tire receipt template 1'});
 doc.setCreationDate(new Date(receipt.createdAt));
 doc.setFileId(createHash('sha256').update(`${receipt._id}:${revision.revision}:1`).digest('hex').slice(0,32).toUpperCase());
 const date=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',dateStyle:'medium'}).format(new Date(receipt.createdAt));
 let y;
 function pageHeader(){
  doc.setFont('helvetica','bold');doc.setFontSize(19);doc.text('City Tire Repair Shop',20,22);
  doc.setFont('helvetica','normal');doc.setFontSize(10);doc.text('5112 N Lincoln Ave, Chicago, IL 60625',20,30);doc.text('(773) 271-6009',20,36);
  doc.setDrawColor(190);doc.line(20,43,190,43);
  doc.setFont('helvetica','bold');doc.setFontSize(13);doc.text('Receipt',20,54);
  doc.setFont('helvetica','normal');doc.setFontSize(10);doc.text(receipt.number,20,62);doc.text(`Date: ${date}`,20,69);doc.text(`Revision: ${revision.revision}`,190,62,{align:'right'});
  y=80;
 }
 const newPage=()=>{doc.addPage();pageHeader();columns();};
 function columns(){doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text('Service',20,y);doc.text('Qty',130,y,{align:'right'});doc.text('Unit price',158,y,{align:'right'});doc.text('Amount',190,y,{align:'right'});doc.setDrawColor(210);doc.line(20,y+3,190,y+3);y+=11;doc.setFont('helvetica','normal');}
 pageHeader();
 if(revision.customer?.name||revision.customer?.phone){
  const customer=doc.splitTextToSize([revision.customer.name,revision.customer.phone].filter(Boolean).join(' | '),165);doc.text(customer,20,y);y+=customer.length*5+7;
 }
 columns();
 for(const item of revision.items){
  const lines=doc.splitTextToSize(item.description,95);let offset=0;
  while(offset<lines.length){
   if(y+9>263)newPage();
   const capacity=Math.max(1,Math.floor((263-y-4)/5));
   const part=lines.slice(offset,offset+capacity);
   doc.text(part,20,y);
   if(offset===0){doc.text(String(item.quantity),130,y,{align:'right'});doc.text(money(item.unitPriceCents),158,y,{align:'right'});doc.text(money(item.lineTotalCents),190,y,{align:'right'});}
   y+=Math.max(8,part.length*5+4);offset+=part.length;
   if(offset<lines.length)newPage();
  }
 }
 if(y+25>270)newPage();
 doc.line(120,y,190,y);y+=10;doc.setFont('helvetica','bold');doc.setFontSize(13);doc.text('Total (USD)',120,y);doc.text('$'+money(revision.totalCents),190,y,{align:'right'});
 const count=doc.getNumberOfPages();
 for(let n=1;n<=count;n++){doc.setPage(n);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(90);doc.text(`${receipt.number}  |  Revision ${revision.revision}`,20,285);doc.text(`Page ${n} of ${count}`,190,285,{align:'right'});}
 return Buffer.from(doc.output('arraybuffer'));
}
module.exports={renderReceiptPdf};
