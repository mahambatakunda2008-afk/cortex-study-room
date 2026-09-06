export type ConceptNode = {
  id: string;
  name: string;
  description: string;
};

export type PrerequisiteEdge = {
  from: string;
  to: string;
  reason: string;
};

export type KnowledgeGraph = {
  nodes: ConceptNode[];
  edges: PrerequisiteEdge[];
};

export const PHYSICS_DEFORMATION_GRAPH: KnowledgeGraph = {
  nodes: [
    {id:'force',name:'Force',description:'The applied load acting on a material.'},
    {id:'area',name:'Cross-sectional area',description:'The area over which the applied force acts.'},
    {id:'stress',name:'Stress',description:'Force per unit cross-sectional area.'},
    {id:'extension',name:'Extension',description:'The change in length produced by loading.'},
    {id:'original-length',name:'Original length',description:'The unloaded length used when calculating strain.'},
    {id:'strain',name:'Strain',description:'Extension divided by original length.'},
    {id:'young-modulus',name:'Young modulus',description:'Stress divided by strain.'},
    {id:'elastic-limit',name:'Elastic limit',description:'The point beyond which permanent deformation begins.'},
    {id:'breaking-point',name:'Breaking point',description:'The point at which the material fractures.'},
  ],
  edges: [
    {from:'force',to:'stress',reason:'Stress requires the applied force.'},
    {from:'area',to:'stress',reason:'Stress requires cross-sectional area.'},
    {from:'extension',to:'strain',reason:'Strain uses extension.'},
    {from:'original-length',to:'strain',reason:'Strain uses original length.'},
    {from:'stress',to:'young-modulus',reason:'Young modulus is calculated from stress.'},
    {from:'strain',to:'young-modulus',reason:'Young modulus is calculated from strain.'},
    {from:'elastic-limit',to:'breaking-point',reason:'Understanding permanent deformation helps distinguish it from fracture.'},
  ],
};

export function prerequisiteIds(graph:KnowledgeGraph,id:string):string[]{
  return graph.edges.filter(edge=>edge.to===id).map(edge=>edge.from);
}

export function prerequisiteNames(graph:KnowledgeGraph,id:string):string[]{
  const ids=new Set(prerequisiteIds(graph,id));
  return graph.nodes.filter(node=>ids.has(node.id)).map(node=>node.name);
}

export function conceptId(topic:string):string{
  return topic.trim().toLowerCase().replace(/\s+/g,'-');
}

export function inferPrerequisiteGap(graph:KnowledgeGraph,topic:string,weakTopics:string[]):string|null{
  const id=conceptId(topic);
  const prerequisites=prerequisiteIds(graph,id);
  const weakIds=new Set(weakTopics.map(conceptId));
  return prerequisites.find(candidate=>weakIds.has(candidate))??null;
}
