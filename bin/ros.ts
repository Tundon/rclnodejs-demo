#!/usr/bin/env ts-node
import * as rcl from "rclnodejs";
import { program } from "commander";

const initialized = rcl.init();
program.name("ros").version("0.1.0");

const nodes = program
  .command("nodes")
  .description("Commands related to ROS2 nodes");
nodes.command("list").description("List all nodes").action(list);

async function list() {
  await initialized;

  const node = new rcl.Node("__ros_ts");
  await delay();
  const result = node.getNodeNamesAndNamespaces();
  console.log(
    result
      .map((x) => `${x.namespace}${x.name}`)
      .filter((s) => s != "/__ros_ts")
      .join("\n")
  );
}

function delay(time?: number) {
  return new Promise((resolve) => setTimeout(resolve, time ?? 300));
}

process.on("exit", () => {
  rcl.shutdown();
});

program.parse();
