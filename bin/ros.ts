#!/usr/bin/env ts-node
import * as rcl from "rclnodejs";
import { program } from "commander";
import { inspect } from "node:util";

const initialized = rcl.init();
program.name("ros").version("0.1.0");

const nodes = program
  .command("nodes")
  .description("Commands related to ROS2 nodes");
nodes.command("list").description("List all nodes").action(list);

const topic = program
  .command("topic")
  .description("Commands related to ROS2 topics");
topic
  .command("list")
  .description("List all topics")
  .action(async () => {
    const node = createNode();
    await delay(500);
    let topicNamesAndTypes = node.getTopicNamesAndTypes();
    console.log(topicNamesAndTypes);
  });

const action = program
  .command("action")
  .description("Commands related to ROS2 action");
action
  .command("list")
  .description("List all actions")
  .action(async () => {
    const node = createNode();
    await delay(500);
    const nodeNamesAndNamespaces = node.getNodeNamesAndNamespaces();
    nodeNamesAndNamespaces.forEach((nameAndNamespace) => {
      console.log(
        rcl.getActionClientNamesAndTypesByNode(
          node,
          nameAndNamespace.name,
          nameAndNamespace.namespace
        )
      );
    });
  });

program
  .command("monitor [topics...]")
  .option("-e, --exclude <topics...>")
  .description(
    "Monitor topic messages. If topics omitted, it will monitor messages for all topics"
  )
  .action(async (topics: string[], options: { exclude?: string[] }) => {
    const node = createNode();
    await delay(500);
    let topicNamesAndTypes = node.getTopicNamesAndTypes();
    if (topics.length > 0) {
      topicNamesAndTypes = topicNamesAndTypes.filter((x) =>
        topics.some((topic) => x.name.includes(topic))
      );
    }
    if (options.exclude) {
      topicNamesAndTypes = topicNamesAndTypes.filter((x) =>
        options.exclude.every((topic) => !x.name.includes(topic))
      );
    }
    console.log(
      `Listening on topics:`,
      topicNamesAndTypes.map((x) => x.name)
    );

    topicNamesAndTypes.forEach((nameAndType) => {
      nameAndType.types.forEach((type) => {
        node.createSubscription(type as any, nameAndType.name, (message) => {
          console.group(`==> ${nameAndType.name}, ${type} `.padEnd(80, "-"));
          console.log(
            inspect(message, { colors: true, compact: true, depth: 10 })
          );
          console.groupEnd();
        });
      });
    });

    node.spin();
  });

async function list() {
  await initialized;

  const node = createNode();
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

/**
 * Create the inspector node.
 */
function createNode() {
  return new rcl.Node("__ros_ts");
}

process.on("exit", () => {
  rcl.shutdown();
});

program.parse();
