const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require("fs");
const csv = require('csv-parser');

const logspace = require('logspace');
const { stringify } = require('querystring');

const {app, BrowserWindow, Menu, ipcMain,dialog} = electron;

var polynomial = require('everpolate').linear
// SET ENV
process.env.NODE_ENV='production';

let mainWindow;
let addSiteWindow;

// Listen for app to be ready
app.on('ready', function() {
  //Create new window
  mainWindow = new BrowserWindow({
    height: 1080,
    width: 1440,
    webPreferences: {
      nodeIntegration: true
    }
  });
  //Load html into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
})

// Handle create addSite window
function createAddSiteWindow() {
  //Create new window
  addSiteWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Site',
    webPreferences: {
      nodeIntegration: true
    }
  });
  //Load html into window
  addSiteWindow.loadURL(url.format({
    pathname: path.join(__dirname,'addSiteWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  // Garbage collection handle
  addSiteWindow.on('close', function(){
    addSiteWindow= null;
  });

  addSiteWindow.setMenu(null);
}

// Handle create editSite window
function createEditSiteWindow() {
  //Create new window
  editSiteWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Site',
    webPreferences: {
      nodeIntegration: true
    }
  });
  //Load html into window
  editSiteWindow.loadURL(url.format({
    pathname: path.join(__dirname,'editSiteWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  // Garbage collection handle
  editSiteWindow.on('close', function(){
    addSiteWindow= null;
  });

  //editSiteWindow.setMenu(null);
}

// Handle create addSite window
function createAddComponentWindow() {
  //Create new window
  addComponentWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Component',
    webPreferences: {
      nodeIntegration: true
    }
  });
  //Load html into window
  addComponentWindow.loadURL(url.format({
    pathname: path.join(__dirname,'addComponentWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  // Garbage collection handle
  addComponentWindow.on('close', function(){
    addComponentWindow= null;
  });

  addComponentWindow.setMenu(null);
}


// Handle create addSite window
function createEditComponentWindow() {
  //Create new window
  editComponentWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Component',
    webPreferences: {
      nodeIntegration: true
    }
  });
  //Load html into window
  editComponentWindow.loadURL(url.format({
    pathname: path.join(__dirname,'editComponentWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  // Garbage collection handle
  editComponentWindow.on('close', function(){
    editComponentWindow= null;
  });

  editComponentWindow.setMenu(null);
}

// Handle create addSite window
function createEditHazardWindow() {
  //Create new window
  editHazardWindow = new BrowserWindow({
    width: 400,
    height: 350,
    title: 'Edit Hazard',
    webPreferences: {
      nodeIntegration: true
    }
  });
  //Load html into window
  editHazardWindow.loadURL(url.format({
    pathname: path.join(__dirname,'editHazardWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  // Garbage collection handle
  editHazardWindow.on('close', function(){
    editHazardWindow= null;
  });
  //editHazardWindow.setMenu(null);
}

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// Create Menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New'
      },
      {
        label:'Load',
        accelerator: process.platform=='darwin' ? 'Command+L' : 'Ctrl+L',
        click(){
          loadSites();
        }
      },
      {
        label:'Save',
        accelerator: process.platform=='darwin' ? 'Command+L' : 'Ctrl+S',
        click(){
          saveSites();
        }
      },
      {
        label:'Quit',
        accelerator: process.platform=='darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ],
  },
  {
    label: 'Sites',
    submenu: [
      {
        label: 'New Site',
        click() {
          createAddSiteWindow();
        }
      }
    ]
  }/*,
  {
    label: 'Hazard',
    submenu: [
      {
        label: 'New Hazard'
      }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Manual'
      },
      {
        label: 'About'
      }
    ]
  }*/
];

let sites = JSON.parse(fs.readFileSync("assets/data/sites_v2.json")); 
let comp = JSON.parse(fs.readFileSync("assets/data/components.json"));
let results={};
let siteIndex=0;



ipcMain.on('sites:load',function(e,item){ 
  console.log('loading sites')
  mainWindow.webContents.send('sites:load', sites,comp);
  console.log('loading finished')
});

// retrieve site Index when it got selected
ipcMain.on('sites:newWindow',function(e){ 
  createAddSiteWindow();
});

ipcMain.on('site:edit:open',function(e,siteIndex){ 
  createEditSiteWindow();
  
  siteIndex=parseInt(siteIndex);
  
  editSiteWindow.webContents.on('did-finish-load', () => {
    editSiteWindow.webContents.send('site:give', sites.features[siteIndex],siteIndex);
  });
});

// retrieve site Index when it got selected
ipcMain.on('hazard:edit:open',function(e,hazard,siteIndex,hazardIndex){ 
  createEditHazardWindow();
  
  editHazardWindow.webContents.on('did-finish-load', () => {
    editHazardWindow.webContents.send('hazard:give', hazard,siteIndex,hazardIndex);
  });
});

// retrieve site Index when it got selected
ipcMain.on('hazard:edit:send',function(e,hazard,siteIndex,hazardIndex) { 
  editHazardWindow.close();
  sites.features[siteIndex].hazards[hazardIndex]=hazard;
  mainWindow.webContents.send('hazard:edit:apply');
});


// retrieve site Index when it got selected
ipcMain.on('sites:selected',function(e,item){ 
  siteIndex=item;
});

// retrieve site hazard from given files
ipcMain.on('hazard:load',function() { 
  //load csv files with hazard meta
  var numHazard=sites.features[siteIndex].numHazards
  mainWindow.webContents.send('hazard:retrieve', sites.features[siteIndex].hazards);
});

// retrieve site hazard from given files
ipcMain.on('hazard:add',function() { 
  //load csv files with hazard meta
  var numHazard=sites.features[siteIndex].numHazards

  var haz={};

  dialog.showOpenDialog({filters: [{
    name: 'Open Hazard File',
    extensions: ['csv']
  }]}, 
  (fileName) => {
    if(fileName===undefined){
      console.log("No files were selected");
      return;
    }
    
    var row_i=0;
    var data=[];
    fs.createReadStream(fileName[0])
      .pipe(csv())
      .on('data', (row) => {
        data.push(row)
      })
      .on('end', () => {
        haz.name=fileName[0]
        haz.label='Hazard_' + sites.features[siteIndex].hazards.length
        
        console.log('CSV file successfully processed');
        var keys=Object.keys(data[0])
        haz.metrics=[];
        haz.units=[];
        haz.values=[];
        haz.rate=[];
        
        for (j=0;j<keys.length-1;j++) {
          
          haz.metrics.push(keys[j+1])
          haz.units.push('unknown')
          
        }
        //make rate vector
        for (i=0; i<data.length;i++) {
          haz.rate.push(parseFloat(data[i][keys[0]]))
        }
        //create value vector
        for (j=0;j<keys.length-1;j++) {
          var v=[];
          for (i=0; i<data.length;i++) {
            v.push(parseFloat(data[i][keys[j+1]]))
          }
          
          haz.values.push(v);
        }
        //add hazards to site
        sites.features[siteIndex].hazards.push(haz);
        mainWindow.webContents.send('hazard:retrieve', sites.features[siteIndex].hazards);
      });
  });
});

ipcMain.on('hazard:delete',function(e,item) { 
  //load csv files with hazard meta
  sites.features[siteIndex].hazards.splice(item,1)
  mainWindow.webContents.send('hazard:retrieve', sites.features[siteIndex].hazards);
  
});


ipcMain.on('component:selected',function(e,thSetup){ 
  //get thresholds
  
  var thresholds;
  //get component thresholds
  for (i=0; i<comp.features.length;i++) {
    for (j=0; j<thSetup.length;j++) {
      if (comp.features[i].label==thSetup[j].label) {
        comp.features[i].thresholds
      }
    }
  }

  //call site hazards
  var hazards=sites.features[(siteIndex)].hazards;
  
  res=getThresholdRP(thSetup,hazards)
  mainWindow.webContents.send('components:threshold', res);
});

function getThresholdRP(thSetup,hazards) {
  var value=0;
  var threshold_hazard=[];
  //get threshold return period
  var k0=-1
  var ki=0;
  var value0=9999999999;
  for (hi=0; hi<hazards.length;hi++) {
    for (hj=0; hj<hazards[hi].values.length;hj++) {
      k0+=1;
      for (ci=0; ci<thSetup.length;ci++) {
        if ((thSetup[ci].label==hazards[hi].label) & (thSetup[ci].metric==hazards[hi].metrics[hj])) {
          
          var metric=thSetup[ci].metric
          var th=thSetup[ci].value
          //loops over metrics
          var rp=hazards[hi].rate; //occurrance rate
          var val=hazards[hi].values[hj]; //metric values
              //const spline = new Spline(val, rp);
          
          value=interpolate1d(th,val,rp);
          threshold_hazard.push([thSetup[ci].label,metric,value,th])

          if ((value>0) & (value<value0)) {
            value0=value;
            ki=k0;
          }

        }
      }
      
    }
    
  }
  var res={}
  res.th=threshold_hazard
  res.hi=ki;
  return res
}

function interpolate1d(z,x,y) {
  var value=0.0;
  for (ii=0;ii<x.length-1;ii++) {
    if ((z>=x[ii] && z<=x[ii+1]) ||  (z<=x[ii] && z>=x[ii+1])) {
      value=y[ii]+(z-x[ii]) * (y[ii+1]-y[ii]) / ( x[ii+1]-x[ii]);
    }
  }
  return value
}


ipcMain.on('simulate',function(e,setup,item,timeWindow) {
  
  results.primary={};
  
  var hazards=sites.features[(siteIndex)].hazards;
  //get component thresholds
  var timeFactor=365.0/parseFloat(timeWindow);
  
  //get thresholds
  var threshold_hazard=getThresholdRP(setup,hazards)

  k=0
  //get primary hazard
  for (j=0; j<setup.length;j++) {
    for (i=0; i<hazards.length;i++) {
      if (setup[j].label==hazards[i].label && setup[j].primary==true) {
        for (m=0; m<hazards[i].metrics.length;m++) {
          if (hazards[i].metrics[m]==setup[j].metric) {
            var label0=setup[j].label;
            var haz0=hazards[i].values[m];
            var rate0=hazards[i].rate;
            results.primary.label=label0;
            results.primary.name=hazards[i].name;
            results.primary.metric=hazards[i].metrics[m];
            results.primary.unit=hazards[i].units[m];
            results.primary.maximum=Math.max.apply(null,hazards[i].values[m])
            results.primary.minimum=Math.min.apply(null,hazards[i].values[m])

            //for (k=0;k<threshold_hazard.length;k++) {
            //  if ((setup[j].label==threshold_hazard.th[k][0])  & (setup[j].metric==threshold_hazard.th[k][1])) {
                results.primary.threshold=threshold_hazard.th[j][2];//=setup[i].threshold;
                results.primary.thval=threshold_hazard.th[j][3];
           //   }
           // }

            th0=results.primary.threshold;//setup[i].threshold
            k+=1
          }
        }
      }
    }
  }

  for (i=0; i<rate0.length;i++) {
    rate0[i]=rate0[i]*timeFactor;
  }

  results.secondary=[]
  th1=0
  //compute hazard curves
  for (i=0; i<setup.length;i++) {
    if (setup[i].primary==false) {//if not primary
      
      var hazResults={};
      //get secondary hazard
     
      for (j=0; j<hazards.length;j++) {
        for (m=0; m<hazards[j].metrics.length;m++) {
          
          if ((setup[i].label==hazards[j].label)  & (hazards[j].metrics[m]==setup[i].metric)) {
              var haz1=hazards[j].values[m];
              var rate1=hazards[j].rate;
              hazResults.name=hazards[j].name;
              hazResults.label=hazards[j].label;
              hazResults.metric=hazards[j].metrics[m];
              hazResults.unit=hazards[j].units[m];
              
              hazResults.maximum=Math.max.apply(null,hazards[j].values[m])
              hazResults.minimum=Math.min.apply(null,hazards[j].values[m])
              

              //for (k=0;k<threshold_hazard.length;k++) {
               // if ((setup[i].label==threshold_hazard.th[k][0])  & (hazards[j].metrics[m]==threshold_hazard.th[k][1])) {
                  hazResults.threshold=threshold_hazard.th[i][2];//=setup[i].threshold;
                  hazResults.thval=threshold_hazard.th[i][3];
            //    }
            //  }

              th1=hazResults.threshold;
              //if (setup[i].threshold>th1) {th1=setup[i].threshold;}
            }
        }
        
      }
      //create return period increments

      if (th1==0) {th1=1000;}
      const rp_start=Math.floor(Math.log10(Math.sqrt(th1*th0))+1);
      const rp_end=9

      var rp_target=logspace(rp_start,rp_end,(rp_end-rp_start+1))

      hazResults.rp_target=rp_target;
      hazResults.x=[];
      hazResults.y=[];
      //create multi-hazard curves for each return period increment
      for (r=0;r<rp_target.length;r++) {//
        const inc=21;
        var x0=logspace(2,Math.log10(rp_target[r]),inc);
        
        var x=[];
        for (j=0;j<inc-1;j++) {
          if (x0[j]>Math.min.apply(null,rate0) && x0[j]<Math.max.apply(null,rate0)) {
            x.push(x0[j]);
          }
        }

        var y=[];
        //primary ground motions
        for (j=0;j<x.length;j++) {
          y.push(interpolate1d(x[j],rate0,haz0));
        }
        //remaining probabilities
        var x2=[];
        var y2=[];
        var x1=[];
        var y1=[];
        for (j=0;j<x.length;j++) {
          const xj=rp_target[r]/x[j];
          if (xj>Math.min.apply(null,rate1) && xj<Math.max.apply(null,rate1)) {
            x2.push(xj);
            x1.push(x[j]);
            y1.push(y[j]);
            y2.push(interpolate1d(xj,rate1,haz1));
          }
        }

        hazResults.x.push(y1);
        hazResults.y.push(y2);
        
      }
      results.secondary.push(hazResults);
    }
  }
  
  mainWindow.webContents.send('getSimulationResults', results);

});



//-----ADD SITES WINDOW-----//
//load sites at start up or via button
function loadSites() {
  dialog.showOpenDialog((fileNames) => {
    if(fileNames===undefined){
      console.log("No files were selected");
      return;
    }
    sites = JSON.parse(fs.readFileSync(fileNames[0]));
    //loadHazard(sites)
    siteIndex=0;
    mainWindow.webContents.send('sites:update', sites);
  });
}

//save sites
function saveSites() {
  dialog.showSaveDialog({filters: [{
    name: 'Sites library',
    extensions: ['json']
  }]}, 
  (fileName) => {
    if(fileName===undefined){
      console.log("No files were selected");
      return;
    }

    fs.writeFile(fileName, JSON.stringify(sites, null, 4), (err) => {
        if (err) {
            console.error(err);
            return;
        };
        console.log("File has been created");
    });
  });
}

ipcMain.on('components:save',function saveComponents(e,components) {
  comp=components;
  dialog.showSaveDialog({filters: [{
    name: 'Components library',
    extensions: ['json']
  }]}, 
  (fileName) => {
    if(fileName===undefined){
      console.log("No files were selected");
      return;
    }

    fs.writeFile(fileName, JSON.stringify(comp, null, 4), (err) => {
        if (err) {
            console.error(err);
            return;
        };
        console.log("File has been created");
    });
  });
});

ipcMain.on('components:load',function saveComponents() {
  dialog.showOpenDialog((fileNames) => {
    if(fileNames===undefined){
      console.log("No files were selected");
      return;
    }
    comp = JSON.parse(fs.readFileSync(fileNames[0]));
    //loadHazard(sites)
    siteIndex=0;
    mainWindow.webContents.send('components:update', comp);
  });
});


//create new site
ipcMain.on('sites:add',function(e,item){
  //console.log(item);
  sites.features.push(item);
  mainWindow.webContents.send('sites:update', sites);
  addSiteWindow.close();
});

ipcMain.on('sites:edit:update',function(e,site,siteIndex){
  //console.log(item);
  sites.features[siteIndex]=site;

  mainWindow.webContents.send('sites:update', sites);
  if (addSiteWindow) {
    addSiteWindow.close();
  }
  if (editSiteWindow) {
    editSiteWindow.close();
  }
});

ipcMain.on('component:add:open',function(e,components){
  comp=components;
  createAddComponentWindow();

});

//create new site
ipcMain.on('component:add',function(e,item){
  for (i=0; i<comp.features[0].thresholds.length;i++) {
    thc={}
    thc.label=comp.features[0].thresholds[i].label;
    
    thc.unit=comp.features[0].thresholds[i].unit;
    thc.metric=comp.features[0].thresholds[i].metric;
    thc.value=0;
    item.thresholds.push(thc)
  }

  comp.features.push(item);
  mainWindow.webContents.send('components:update', comp);
  addComponentWindow.close();
});

ipcMain.on('component:edit:open',function(e,components,selected_component){ 
  comp=components
  createEditComponentWindow();
  for (i=0;i<comp.features.length;i++) {
    if (comp.features[i].label==selected_component) {
      ci=i;
    }
  }
  
  editComponentWindow.webContents.on('did-finish-load', () => {
    editComponentWindow.webContents.send('component:give', comp.features[ci],ci);
  });
});
// retrieve site Index when it got selected
ipcMain.on('component:edit:send',function(e,component,ci) { 
  editComponentWindow.close();
  comp.features[ci]=component;
  mainWindow.webContents.send('components:update', comp);
});





//delete site
ipcMain.on('sites:remove',function(e,item){
  delete sites.features.splice(item,1);
  mainWindow.webContents.send('sites:update', sites);
});


ipcMain.on('results:save', function() {
  dialog.showSaveDialog({filters: [{
    name: 'Results Library',
    extensions: ['json']
  }]}, 
  (fileName) => {
    if(fileName===undefined){
      console.log("No files were selected");
      return;
    }

    fs.writeFile(fileName, JSON.stringify(results, null, 4), (err) => {
        if (err) {
            console.error(err);
            return;
        };
        console.log("File has been created");
    });
  });
});






//Add developer tools item if not in prod
if(process.env.NODE_ENV=='production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform =='darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}