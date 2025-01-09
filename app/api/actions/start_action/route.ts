import { NextResponse } from "next/server";


export const GET = async (
) => {
  // 生成动态的响应数据
  const payload = {
    title: "ThreeCupsOneBall",
    icon: "https://www.threecupsoneball.fun/start.jpg",
    description:
      "Done be afraid now, take a pick!Guess correctly and win a prize",
    label: "Play!",
    links: {
      actions: [
        {
          type: "post",
          label: "Left",
          href: "https://www.threecupsoneball.fun/api/actions/start_action?path1=path1/correct_action",
        },
        {
          type: "post",
          label: "Middle",
          href: "https://www.threecupsoneball.fun/api/actions/start_action?path2=path1/wrong_action",
        },
        {
          type: "post",
          label: "Right",
          href: "https://www.threecupsoneball.fun/api/actions/start_action?path3=path1/wrong_action",
        },
      ],
    },
  };

  return NextResponse.json(payload, { status: 200 });
};