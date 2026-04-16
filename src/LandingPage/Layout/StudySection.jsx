import DarkColorButton from "../../components/Buttons/DarkColorButton";
import Select from "../../components/Select";
import girlImg from "../../assets/ girl.png";

function StudySection() {
    return (
        <div className="3xl:py-16 3xl:px-60 lg-md:max-3xl:px-20 lg-md:max-3xl:py-12 md:max-lg-md:px-8 md:max-lg-md:py-6  sm-sm:max-lg-sm:px-4">
            <div className="gap-20 p-2 bg-customBlueLight mx-auto my-80 sm-sm:max-sm:my-20  rounded-3xl w-[91rem] sm-sm:flex-col sm-sm:w-full  sm-sm:gap-0 sm-sm:pb-8 flex sm-lg:flex-row items-center justify-around ">
                <img
                    className="scale-125 -translate-y-16 sm-sm:scale-90 sm-lg:scale-110 lg-md:scale-125 "
                    src={girlImg}
                    alt="girl Image"
                />
                <form className="flex flex-col gap-5">
                    <Select
                        options={[
                            {
                                value: "option1",
                                label: "Que voulez-vous étudier?",
                            },
                            {
                                value: "option2",
                                label: "Que voulez-vous étudier?",
                            },
                        ]}
                    />
                    <Select
                        options={[
                            {
                                value: "option1",
                                label: "Que voulez-vous étudier?",
                            },
                            {
                                value: "option2",
                                label: "Que voulez-vous étudier?",
                            },
                        ]}
                    />
                    <div className="sm-lg:place-self-start  sm-sm:place-self-center ">
                        <DarkColorButton
                            style="  sm-sm:w-[16rem] sm-sm:text-sm md:w-[18rem] md:text-lg"
                            text="S'inscrire"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
export default StudySection;
