import { ChartFactory } from "./chartFactory";
import { Tree, TreeNode } from "./dataStructures/tree";
import { WorkItemClassifier, WorkItemType } from "./workItemClassifier";
import Vue from 'vue'
import App from "./App.vue";

const CompleteColour = "rgba(0, 122, 204, 1.0)";
const NotCompletedColour = "rgba(109, 109, 109, 0.25)";

//     private generateFeatureBreakdown(tree: Tree) {
//         let features = [];
//         let featureNodes = tree._root.children;
//         featureNodes.forEach(function(node, index){
//             let feature = {
//                 title: node.data.fields["System.Title"],
//                 children: []
//             };

//             let featureTree = new Tree(node)
//             featureTree.traverseBF(function(node:TreeNode) {
//                 if(WorkItemClassifier.getWorkItemType(node.data) === WorkItemType.Feature) {
//                     return;
//                 }
//                 let tfsItem = {
//                     title: node.data.fields["System.Title"],
//                     state: node.data.fields["System.State"]
//                 }
//                 feature.children.push(tfsItem);
//             });
//             features.push(feature);
//         })

//         const featureChartData : Chart.ChartData = {
//             labels: features.map(a => a.title),
//             datasets: []
//         };

//         let completedDataSet : Chart.ChartDataSets = {
//             label: "Completed",
//             data: features.map(x => x.children.reduce((acc, val) => { 
//                 let state = val.state;
//                 if(state === "Done") {
//                     return acc += 1;
//                 }
//                 return acc;
//             }, 0)),
//             backgroundColor: CompleteColour
//         };

//         let notCompletedDataSet : Chart.ChartDataSets = {
//             label: "Not Completed",
//             data: features.map(x => x.children.reduce((acc, val) => { 
//                 let state = val.state;
//                 if(state === "In Progress" || state === "Proposed" || state === "Resolved" || state === "New" ||state === "To Do") {
//                     return acc += 1;
//                 }
//                 return acc;
//             }, 0)),
//             backgroundColor: NotCompletedColour
//         };

//         featureChartData.datasets.push(completedDataSet);
//         featureChartData.datasets.push(notCompletedDataSet);

//         this.chartFactory.CreateChart("featureBreakdownChart",  "bar", featureChartData, "Feature Status Breakdown");

//         return features;

//     }
// };


// let chartFactory = new ChartFactory();
// let workItemRetriever = new WorkItemRetriever();
// let projectId = VSS.getWebContext().project.id;

// let visualizer = new TFSVisualizer(projectId, chartFactory, workItemRetriever);
// visualizer.getInitatiatives();

// let initiativeSelection : HTMLSelectElement = <HTMLSelectElement>document.getElementById('initiativeSelection')
// initiativeSelection.onchange = function(){
//     let selectedIndex = initiativeSelection.selectedIndex;
//     let initiativeId = initiativeSelection.options[selectedIndex].value;
//     visualizer.generateReport(initiativeId).then(function(features){
//         var app = new Vue({
//             el: '#app',
//             data: {
//               message: 'Hello Vue!',
//               features: features
//             }
//           })
//     });
// };

new Vue({
    el: '#app',
    render: h => h(App)
  });


VSS.notifyLoadSucceeded();
